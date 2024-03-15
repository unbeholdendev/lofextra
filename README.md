# Local-first expense tracker

todo: links

## Motivation

I've been looking for a solution to track my family's expenses. Being a privacy aware individual, I've naturally discarded all the commercial solutions. True, there are a few self-hosted options that I've tried like [Actual](https://actualbudget.org/) or [Firefly III](https://www.firefly-iii.org/), but I found both of them unnecessarily complex and without support for multiple accounts (like for me and my wife). Luckily, I've got a skillset that allows me to build a solution myself. The solution that will leverage human's right for (sensitive!) data ownership.

## High level overview

This expense tracker differs from other apps of similar nature by storing all the data locally on your device in SQLite database. Yet, it's still powerful enough to enable realtime collaboration using a server to sync updates between devices. These updates are encrypted so the server has no idea what's flowing in and out. You as a user don't need to register, you don't need email nor password. You get 12 word mnemonic phrase (like in bitcoin) that acts like your account key. Use the mnemonic on the other device and see your data sync automatically.

Other important aspect is offline support. The app works online seamlessly, the updates are synced when you come back online. Possible conflicts are resolved using LWW (last write wins) algorithm enhanced with [Hybrid Logical Clock](https://jaredforsyth.com/posts/hybrid-logical-clocks/).

## Features

The current version of the app is mostly proof of concept. It offers mnemonics, data encryption/decryption, synchronization, offline support. As for the expense tracking part, the most core features that I'm used to using are supported. Users can add transactions, edit and delete them, attach one of the predefined categories, see their total spending in the last 30 days.

## Plans

- react native coming
- recurring, budgeting
- currency
- creating npm lib to build app upon

## ORM

## Contributions

## Alternative solutions for building local-first apps

I've strongly considered using [Evolu](https://www.evolu.dev/) as a tool for building local-first app. Despite the maintainer's effort to offer a straightforward solution comprehensible to all developers, the library's integration of [Effect](https://effect.website/), a tool not widely adopted among developers, doesn't help achieving this goal. Furthermore, I wasn't able to make it run at all, always ran into errors so it eventually became a debugging hell. You shouldn't have to struggle with a library like that.
