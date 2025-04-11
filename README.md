<p align="center">
  <a href="https://generaltranslation.com" target="_blank">
    <img src="https://generaltranslation.com/gt-logo-light.svg" alt="General Translation" width="100" height="100">
  </a>
</p>

# Overview

General Translation is a **one-stop solution** for all your translation needs. It includes:

- A set of libraries for React and Next.js
- A translation platform
- A free AI-powered translation service

With General Translation, you never need to worry about localization again. Just install the libraries in your project, wrap your content as you code, and we'll take care of the rest.

With General Translation, you can internationalize your entire app in minutes.

Get started at [generaltranslation.com](https://generaltranslation.com)!

Full documentation, including guides, examples, and API references, can be found in the [docs](https://generaltranslation.com/docs).

Join our [Discord community](https://discord.gg/W99K6fchSu) to get help and stay updated!

## Library Features

### ⚛️ Translate entire React components, not just strings

- Just wrap your content in a `<T>` component!
- No need for complex refactoring or messy function calls.

```tsx
export default function Page() {
  return (
    <T>
      <p>You can write any JSX as children of the {'<T>'} component.</p>
      <p>
        For example, you could write a <a href='/'>link</a> and have the text be
        translated in context.
      </p>
      <div>
        <div>
          <p>Even deeply nested components are translated in context.</p>
          <button>Click me!</button>
        </div>
      </div>
    </T>
  );
}
```

### 🔎 Feature parity with existing libraries

- GT libraries also support the same features as existing libraries like `i18next`, `react-intl`, and `next-intl`.
- Features such as dictionaries, plurals, currencies, and automatic routing are all supported.

### 🔧 Developer-friendly

- Setup is simple and can be done in minutes.
- All GT libraries are open-source and work standalone.
  - You can use your own translation provider or use our free AI-powered translation service.
- No more wasting time managing translation keys like `t('menu.header.title')`.
  - Just write everything in-line!

### 🧠 Free AI-powered translation service

- Translation hot reload in development
- Libraries integrate natively with our translation platform.
- Translations are generated for your app in seconds.
- HTML content is re-arranged and customized according to the language.

## Examples

See the [examples](examples) directory for some example projects that use our libraries. We currently support React and Next.js.

Simple interface for native pluralization and conditional logic:

```tsx
<Plural
  n={count}
  singular={<>There is {count} item</>}
  plural={<>There are {count} items</>}
/>
```

Support for translation at runtime:

```tsx
export default function Comment() {
  const comment = await getComment();

  return (
    <h1>Author: {comment.author}</h1>
    <Tx>
      <p>{comment.content}</p>
    </Tx>
  );
}
```

Intuitive i18n formatting syntax:

```tsx
return (
  <T>
    <h1> Your account information: </h1>
    Account balance: <Currency>{account.bal}</Currency> // Currency Formatting
    <br />
    Updated at: <DateTime>{account.updateTime}</DateTime> // Datetime Formatting
    <br />
    Transactions this month: <Num>{account.txCount}</Num> // Number Formatting
  </T>
);
```

## Libraries

See the below for links to the relevant libraries:

- [gt-next](packages/next/README.md): Automatic i18n for Next.js
- [gt-react](packages/react/README.md): Automatic i18n for React
- [generaltranslation](packages/core/README.md): Core library for General Translation
- [supported-locales](packages/supported-locales/README.md): Currently supported locales
- [gtx-cli](packages/cli/README.md): CLI tool for React apps

## Installation

Any of the libraries can be installed via npm, yarn, pnpm, or bun.

For example, to install `gt-next`:

```bash
npm install gt-next
yarn add gt-next
```

Usage of the libraries is documented on our [docs](https://generaltranslation.com/docs).

## Contributing

We welcome any contributions to our libraries. Please submit a pull request!

## CI/CD Workflows

This repository uses GitHub Actions for continuous integration and deployment:

### Package CI Workflow

The `package-ci.yml` workflow runs when changes are pushed to packages in the `packages/` directory:

1. Detects which packages have been changed
2. Runs CI for each changed package (build steps)
3. Automatically creates a version bump PR that:
   - Bumps the package.json version (patch)
   - Opens a pull request with the version change

### Package Release Workflow

The `package-release.yml` workflow runs when a version bump PR is merged to main:

1. Detects which packages have version changes
2. For each package with a version change:
   - Builds the package
   - Runs `npm run release` to publish to npm
   - Creates a GitHub release with the new version tag

You can also manually trigger a release for a specific package using the workflow dispatch.
