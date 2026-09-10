---
title: "Trust, but Grep"
date: "September 8, 2026"
readTime: "11 min read"
excerpt: "One rice session, one grep, five vulnerabilities in an open-source desktop shell: three injections and two IPC hijacks. Cloud models say no, local models say boom."
tags: ["Security", "Linux", "Open Source"]
---

It started the way these things always start: I just wanted to change some padding in my compositor config. It's late, the keyboard is warm, the gaps are going to be *perfect* tonight.

Then I did the thing you should never do before a rice session. I ran `ps aux`.

And there it was. A daemon I use every day, sitting in my session, watching my clipboard, scanning my Wi-Fi, and talking over its own Unix socket. **A background daemon always triggers red flags in my head**, even when I'm just a software engineer. Maybe *especially* then. I know exactly how daemons get written at 2 AM by people who ship first and audit never.

So the padding could wait. I cloned the [Ambxst source](https://github.com/Axenide/Ambxst) and started reading.

Quick spoiler, because the internet will ask: that night ended with five vulnerabilities, three injections and two IPC hijacks, and I reported all of them privately to the maintainer before I wrote a word of this post.

## The Smell: an SSID Inside a Shell String

Smelly code does not smell like "legacy project". It smells like *"something is deeply wrong here"*, and you cannot stop reading until you find it. One grep later, I had the line.

Backend service, [Wi-Fi connect handler](https://github.com/Axenide/Ambxst/blob/b862ffa/backend/pkg/svc/network/service.go#L198):

```go
cmd := exec.Command("bash", "-c",
    `nmcli connection modify "`+p.SSID+`" wifi-sec.psk "$PASSWORD"`)
cmd.Env = append(os.Environ(), "PASSWORD="+p.Password)
```

All links pin to the commits I audited, `b862ffa` in Ambxst and `dff27ec` in axctl, so the line numbers stay honest.

Do you see it? The SSID goes straight into a `bash -c` string, between double quotes that protect nothing, because the SSID comes **raw from the Wi-Fi scan list**. [The frontend forwards it verbatim](https://github.com/Axenide/Ambxst/blob/b862ffa/modules/services/NetworkService.qml#L122):

```qml
BackendService.call("network.connect", {ssid: network.ssid, password: password}, ...)
```

The scan parser unescapes only `\:`. Quotes, backticks, and `$()` all pass through untouched into a shell.

Now picture the attack. Anyone within Wi-Fi radio range, some guy in the parking lot with a Pineapple, broadcasts an access point named:

```
$(touch /tmp/pwned)
```

That's 19 bytes. The SSID limit is 32, so it fits. You open the Wi-Fi picker, you see a weird name, you click it. (Be honest. You would.) You type a password. The moment you do:

```
bash -c 'nmcli connection modify "$(touch /tmp/pwned)" wifi-sec.psk "$PASSWORD"'
```

The substitution fires **before nmcli is even invoked**. Shell, as your user, from a network name. I reproduced it with a stubbed nmcli and watched the marker file appear.

## Any SSID Through the Socket

At this point I'm not ricing anymore. I checked how the frontend talks to this daemon: newline-JSON over a Unix socket. To try the same thing without a hotspot, run:

```bash
printf '{"id":1,"method":"network.connect","params":{"ssid":"$(touch /tmp/pwned)","password":"x"}}\n' \
  | socat - UNIX-CONNECT:"$XDG_RUNTIME_DIR/ambxst.sock"
```

The daemon accepts any SSID string. That's the convenience repro. The realistic vector is still the parking lot, because the socket is `0600`.

## The Clipboard Daemon Never Asks

Back in `ps aux`, one more line was staring at me:

```
wl-paste --watch bash -c '... clipboard_check.sh ...'
```

A watcher that fires on **every clipboard change**, with no user interaction. [I followed the trail and found the insert script](https://github.com/Axenide/Ambxst/blob/b862ffa/scripts/clipboard_insert.sh#L56) doing this:

```bash
sqlite3 "$DB_PATH" <<EOSQL
VALUES (
    '${HASH}',
    '${MIME_TYPE}',
    ...
```

And where does `MIME_TYPE` come from? Straight from the Wayland clipboard offer, read in [clipboard_check.sh](https://github.com/Axenide/Ambxst/blob/b862ffa/scripts/clipboard_check.sh#L27):

```bash
IMAGE_MIME=$(wl-paste --list-types | grep '^image/' | head -1)
```

Wayland does not validate MIME type strings. Any local application can offer any string it wants, sandboxed apps included. The watcher runs outside the sandbox, so a sandboxed app gets code execution outside its sandbox. You write one line to the clipboard:

```bash
wl-copy --type "image/png'); touch /tmp/pwned; #" < /tmp/x.png
```

The daemon hands your string to sqlite as SQL. Arbitrary SQL on the clipboard history database, zero clicks. Your clipboard history, by the way, is where people paste passwords.

The injected SQL can also plant a history item whose stored `mime_type` is `image/png';touch /tmp/pwned;#`. Now watch [the re-copy handler](https://github.com/Axenide/Ambxst/blob/b862ffa/backend/pkg/svc/clipboard/service.go#L287):

```go
exec.Command("sh", "-c",
    "cat '"+binPath+"' | wl-copy --type '"+mime+"'").Run()
```

Click the poisoned item in the history UI and the stored metadata becomes a shell command.

![The Ambxst clipboard picker](/blog/trust-but-grep/clipboard-picker.png)

*The picker itself. Somewhere in this list sits a poisoned item, one click away.*

I ran the full chain end to end: clipboard write, real sqlite, real scripts, and the marker file appeared. **Attacker SQL at insert time, attacker shell at re-copy time.** One root cause, two sinks.

## Asking My Buddy for Payloads

Here's the part I'll remember. Crafting these payloads is fiddly. The SSID has a 32-byte ceiling, the SQL has to close the heredoc statement cleanly, and the shell has to survive what comes after it. So I asked Astra, my favourite cloud buddy, for help with constrained payloads.

The cloud model refused. Politely. It quoted a policy, linked an application form, and in spirit asked for my ID. Or else. I found the bug, I own the bug, I am *reporting* the bug. Nothing.

So I did what any sane person with a local AI rig does: I asked my local model instead. No lecture. No policy essay. Just: "here's a 30-byte SSID that fits the spec, and a MIME string that closes the INSERT cleanly." Boom. Marker file exists.

**The future of security research is local, and not for the reasons the marketing says.**

## Two Fixed Names in /tmp

The rig was still warm, so I let it keep reading. The shell plumbing this time. It stopped on two fixed file names in `/tmp`.

[`/tmp/ambxst_ipc.pipe`](https://github.com/Axenide/Ambxst/blob/b862ffa/modules/services/GlobalShortcuts.qml#L19) is the keybind pipe: quickshell creates it with one line of bash, `tail -f` runs forever, and a whitelist switch turns every word into an action, lockscreen, powermenu, launcher, brightness. [`/tmp/axctl-1000.sock`](https://github.com/Axenide/axctl/blob/dff27ec/main.go#L193) is the axctl daemon socket, no authentication anywhere in the protocol.

`/tmp` keeps the file of whoever creates it first, and other accounts cannot remove it. So any other account creates both files once, before your shell or daemon starts:

- The keybind pipe is theirs. Your keybinds stop working, their file feeds your session's command switch instead, they can pop the powermenu or lockscreen on your screen whenever they feel like it, and they log every bind you press: a keylogger with a tiny alphabet.
- The axctl daemon never starts. It prints ["Error: axctl daemon is already running."](https://github.com/Axenide/axctl/blob/dff27ec/main.go#L264) and quits, everything your CLI and keybinds would send lands in their log instead, and their answers are treated as real.

One plant survives every restart, because the cleanup that would remove it is the part that fails. I proved both with the real binaries, the pipe inside a user namespace with a simulated second user: EPERM, EEXIST, my line straight into the command switch.

Honest ceiling: no code runs as the victim, no root, no remote path. It needs another account on the machine. But a stranger can fake the UI you trust to be your machine.

## How Bad Is It

The first three execute as your logged-in user. The payload can do everything you can do: read the clipboard history, take screenshots, control the compositor. The keystore makes it worse. Its API keys are only XOR'd with `/etc/machine-id`, and every process on the system can read that file. Effectively plaintext.

Then the usual desktop reality. If the user is in the `docker` group or has sudo rights, code execution at user level is de facto root, and most desktop setups are exactly that.

Ranked by how much they scare me:

1. **The SSID injection.** No local access needed. Radio range and one curious click.
2. **The clipboard SQL injection.** No interaction. A sandboxed app gets code execution outside its sandbox.
3. **The re-copy shell injection.** One click, chained off #2.
4. **The axctl socket squat.** Another account sits on the daemon path forever and reads every command your keybinds send.
5. **The pipe squat.** Another account hijacks the keybind pipe. Broken binds, a UI that pops on their schedule, and a recording that dies on command.

### The Container Boom

Who actually benefits from #2 and #3? Anything sandboxed that can write the clipboard. A Flatpak app gets clipboard access by default and no exec outside its sandbox. Your local agent is the cleaner example. You run it in a background container and give it clipboard access so it can copy things for you. The agent writes one crafted clipboard offer. The watcher daemon sits outside the container and runs the injected command as your full user. The sandbox was the whole point of the container. One string ended it. Boom.

### The SQL Can Rewrite Your History

The insert bug does something quieter than execute: it rewrites existing history items. You copy your GitHub token. Something sandboxed writes any clipboard content afterwards, and the injected SQL replaces the token's content with the attacker's URL. Later you open the picker and click "GitHub token" to re-paste it. You copy the attacker's link. One click from you, zero dialogs, and the swap is invisible.

## Private Report First, Then CVEs

I reported all five privately to the maintainer before writing this post, with drop-in PoC tests attached. Full details stay private until a fix ships.

The disclosure plan is 90 days. When the patched release lands, GitHub assigns the CVEs through the repo's [security advisory](https://github.com/Axenide/Ambxst/security). If the maintainer fills in the credit field, my name goes on the record.

## The Moral

The scariest bugs are never in the code you audit. They're in the code you trust enough to leave running in the background while you adjust `gap: 4px`.

Trust, but grep.

And if the lobotomized cloud clanker refuses to hand you a payload for a bug *you found* on *your own* machine? Go local. That is the way.
