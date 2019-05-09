<h1 align="center">
  recent-searches 🕵️‍♀️🕵️‍♂️
  <br>
  <br>
</h1>
<p align="center" style="font-size: 1.2rem;">A zero dependency JavaScript module that helps anyone build recent searches functionality into their search bar.
</p>


<hr />

[![Build Status][build-badge]][build]
[![downloads][downloads-badge]][npmcharts] [![version][version-badge]][package]
[![MIT License][license-badge]][license]
[![PRs Welcome][prs-badge]][prs]
[![size][size-badge]][unpkg-dist] [![gzip size][gzip-badge]][unpkg-dist]

![Example implementation](https://raw.githubusercontent.com/JonasBa/recent-searches/master/RecentSearchesUX.gif)

## The problem

Building recent searches experience can be trickier than you think (expiry of queries, ranking of recent queries, handling storage etc...)

## Solution
recent-searches module helps you build that experience without having to focus on the edge cases and technical details. If available, uses [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) to store suggestions cross sessions and in the rare cases where it might not be available uses a fallback memory storage, thus loosing it's cross session functionality.

__The module handles:__
- Searching and retrieving recent searches
- Ranking of searches and decaying their popularity (with different ranking options)
- Saving and expiring of searches through LocalStorage or MemoryStorage
- LocalStorage feature detection (with fallback to MemoryStorage)
- Safe LocalStorage usage (feature detection, limiting storage)

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Usage](#usage)
- [LICENSE](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

recent-searches is published on npm's public registry, you can install it as a dependancy of your project with the following command.
```
npm install --save recent-searches
```

## Usage

> [Standalone codesandbox example](https://codesandbox.io/s/8k21924m5l) <br/>
> [Algolia react-instantsearch codesandbox example](https://codesandbox.io/s/m18wjy69) <br/>
> [Algolia InstantSearch.js codesandbox example](https://codesandbox.io/s/62j3k7097r)
Initializing the module

```ts
import RecentSearches from 'recent-searches'

const searches = new RecentSearches({
  ttl: number, // Optional: ttl of searches in milliseconds, default to 24h (1000 * 60 * 60 * 24)
  limit: number, // Optional: max number of entries that will be persisted, default is 50
  namespace: string, // Optional: custom localStorage namespace
  ranking: string // Optional: ranking strategy of recent searches, "PROXIMITY" | "TIME" | "PROXIMITY_AND_TIME", default is "PROXIMITY_AND_TIME"
})

```

Setting and retrieving relevant searches.

```ts
// Retrieve searches for a given query
const previousSearchesForJohn = searches.getRecentSearches("John")
/* 
  [ 
    {query: "John", data: {...}, timestamp: ...},
    {query: "Marc John", data: {...}, timestamp: ...}
  ] 
*/

// To set a recent search
searches.setRecentSearch("John", resultData)

```

If you built something using recent-searches that you want to show, feel free to send us a link and we'll include it to the documentation!

## Contributing

This project is open to contributions, if you have a question, proposal or feedback please open a pull request or issue, we only ask you to be kind and respectful :)

Special thanks to [Kent C. Dodds](https://twitter.com/kentcdodds?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor) for building downshift (making that demo was much easier)

## LICENSE

MIT

[npm]: https://www.npmjs.com/
[node]: https://nodejs.org
[build-badge]: https://circleci.com/gh/JonasBa/recent-searches/tree/master.svg?style=svg
[build]: https://circleci.com/gh/JonasBa/recent-searches
[coverage-badge]: https://img.shields.io/codecov/c/github/recent-searches/recent-searches.svg?style=flat-square
[coverage]: https://codecov.io/github/recent-searches/recent-searches
[version-badge]: https://img.shields.io/npm/v/recent-searches.svg?style=flat-square
[package]: https://www.npmjs.com/package/recent-searches
[downloads-badge]: https://img.shields.io/npm/dm/recent-searches.svg?style=flat-square
[npmcharts]: http://npmcharts.com/compare/recent-searches
[license-badge]: https://img.shields.io/npm/l/recent-searches.svg?style=flat-square
[license]: https://github.com/recent-searches/recent-searches/blob/master/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[react-badge]: https://img.shields.io/badge/%E2%9A%9B%EF%B8%8F-(p)react-00d8ff.svg?style=flat-square
[react]: https://facebook.github.io/react/
[gzip-badge]: http://img.badgesize.io/https://unpkg.com/recent-searches/dist/index.min.js?compression=gzip&label=gzip%20size&style=flat-square
[size-badge]: http://img.badgesize.io/https://unpkg.com/recent-searches/dist/index.min.js?label=size&style=flat-square
[unpkg-dist]: https://unpkg.com/recent-searches/dist/
[module-formats-badge]: https://img.shields.io/badge/module%20formats-umd%2C%20cjs%2C%20es-green.svg?style=flat-square
[spectrum-badge]: https://withspectrum.github.io/badge/badge.svg
[spectrum]: https://spectrum.chat/recent-searches
[emojis]: https://github.com/kentcdodds/all-contributors#emoji-key
[all-contributors]: https://github.com/kentcdodds/all-contributors
[ryan]: https://github.com/ryanflorence
[compound-components-lecture]: https://courses.reacttraining.com/courses/advanced-react/lectures/3060560
[react-autocomplete]: https://www.npmjs.com/package/react-autocomplete
[jquery-complete]: https://jqueryui.com/autocomplete/
[examples]: https://codesandbox.io/search?refinementList%5Btags%5D%5B0%5D=recent-searches%3Aexample&page=1
[yt-playlist]: https://www.youtube.com/playlist?list=PLV5CVI1eNcJh5CTgArGVwANebCrAh2OUE