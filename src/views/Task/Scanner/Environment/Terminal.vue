<template>
  <div ref="terminalRef" class="terminal-container"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Terminal } from 'xterm'
import 'xterm/css/xterm.css'

const terminalRef = ref<HTMLDivElement | null>(null)
let term: Terminal

onMounted(() => {
  term = new Terminal({
    cols: 80,
    rows: 24,
    theme: {
      background: '#1e1e1e',
      foreground: '#ffffff',
    },
  })
  term.open(terminalRef.value!)
  simulateCommandOutput()
})

function simulateCommandOutput() {
  const outputLines = [
    '$ nmap -sV 192.168.1.1',
    'Starting Nmap...',
    'Host is up (0.0031s latency).',
    'PORT     STATE SERVICE VERSION',
    '22/tcp   open  ssh     OpenSSH 7.9p1 Debian 10+deb10u2',
    '80/tcp   open  http    Apache httpd 2.4.38',
    'MAC Address: 00:0c:29:12:34:56',
    'Nmap done: 1 IP address (1 host up) scanned in 1.50 seconds',
    '$ nmap -sV 192.168.1.1',
    'Starting Nmap...',
    'Host is up (0.0031s latency).',
    'PORT     STATE SERVICE VERSION',
    '22/tcp   open  ssh     OpenSSH 7.9p1 Debian 10+deb10u2',
    '80/tcp   open  http    Apache httpd 2.4.38',
    'MAC Address: 00:0c:29:12:34:56',
    'Nmap done: 1 IP address (1 host up) scanned in 1.50 seconds',
    '$ nmap -sV 192.168.1.1',
    'Starting Nmap...',
    'Host is up (0.0031s latency).',
    'PORT     STATE SERVICE VERSION',
    '22/tcp   open  ssh     OpenSSH 7.9p1 Debian 10+deb10u2',
    '80/tcp   open  http    Apache httpd 2.4.38',
    'MAC Address: 00:0c:29:12:34:56',
    'Nmap done: 1 IP address (1 host up) scanned in 1.50 seconds',
    '$ nmap -sV 192.168.1.1',
    'Starting Nmap...',
    'Host is up (0.0031s latency).',
    'PORT     STATE SERVICE VERSION',
    '22/tcp   open  ssh     OpenSSH 7.9p1 Debian 10+deb10u2',
    '80/tcp   open  http    Apache httpd 2.4.38',
    'MAC Address: 00:0c:29:12:34:56',
    'Nmap done: 1 IP address (1 host up) scanned in 1.50 seconds',
    '$ nmap -sV 192.168.1.1',
    'Starting Nmap...',
    'Host is up (0.0031s latency).',
    'PORT     STATE SERVICE VERSION',
    '22/tcp   open  ssh     OpenSSH 7.9p1 Debian 10+deb10u2',
    '80/tcp   open  http    Apache httpd 2.4.38',
    'MAC Address: 00:0c:29:12:34:56',
    'Nmap done: 1 IP address (1 host up) scanned in 1.50 seconds',
    '$ nmap -sV 192.168.1.1',
    'Starting Nmap...',
    'Host is up (0.0031s latency).',
    'PORT     STATE SERVICE VERSION',
    '22/tcp   open  ssh     OpenSSH 7.9p1 Debian 10+deb10u2',
    '80/tcp   open  http    Apache httpd 2.4.38',
    'MAC Address: 00:0c:29:12:34:56',
    'Nmap done: 1 IP address (1 host up) scanned in 1.50 seconds',
    '$ nmap -sV 192.168.1.1',
    'Starting Nmap...',
    'Host is up (0.0031s latency).',
    'PORT     STATE SERVICE VERSION',
    '22/tcp   open  ssh     OpenSSH 7.9p1 Debian 10+deb10u2',
    '80/tcp   open  http    Apache httpd 2.4.38',
    'MAC Address: 00:0c:29:12:34:56',
    'Nmap done: 1 IP address (1 host up) scanned in 1.50 seconds',
  ]

  let i = 0
  const interval = setInterval(() => {
    if (i >= outputLines.length) {
      clearInterval(interval)
    } else {
      term.writeln(outputLines[i])
      i++
    }
  }, 500)
}
</script>

<style>
.terminal-container {
  width: 100%;
  height: auto;
}
</style>
