# Contributing

## Workflow

1. Fork and clone this repository.
2. Create a new branch in your fork based off the **main** branch.
3. Make your changes.
4. Commit your changes, and push them.
5. Submit a Pull Request [here]!

## Contributing to the guides

The guides for all Sapphire Project use [mdx] formatting. At its core this is the exact same as regular markdown, and it supports all your regular GitHub flavoured markdown syntax. Where it differs from this regular markdown however, is that it _also_ supports inline JSX tags. These are used for advanced and optimal layout on `<docs site address pending>`. If you want to learn how and what kind of JSX you can embed into your [mdx] then please consult the [mdx documentation][]

When writing guides there are some rules to follow:

1. All files should have the `.mdx` file extension.
2. Folder names are allowed to have spaces.
3. All folder names should be in strict title case (exempli gratia, Hello World).
4. File names should _never_ have spaces.
5. File names that consist of multiple words should be PascalCased.
6. Information in a guide page should be generally useful to the majority of people.
    - The single exception to this goes to files in the "Advanced" folder, which can cover any type of advanced topics.
7. There are several variables that will be replaced when parsing the `.mdx` file for the documentation website. Variables are denoted by the pattern `{@variableName (parameter)}`. The supported variables are:
    - `{@branch}` - for the current branch name.
    - `{@link <TSDoc symbol name>}` - wherein `<TSDoc symbol name>` is a reference to some TypeScript interface / class / function etc parsed from TSDoc. This will link the API page of that symbol.
    - `{@typedef <TSDoc interface/type/class name>}` - wherein `<TSDoc interface/type/class name>` is the name of a TypeScript interface, class or type. This will inline all the properties of that interface/type/class as a table, with links back to their API documentation page.
    - `{@guide <Guide file name>}` - wherein `<Guide file name>` is the name of another guide file in this same project _without file extension_. For example linking to `CreatingArguments.mdx` would be `{@guide CreatingArguments}`.
8. For variables that are often reused between pages, please add them to `constants.mdx` in the `guides` folder. You can reference these variables just like how you would import code with ES Modules: `import { something } from '../constants.mdx`. **Be sure to include the `.mdx` file extension!**

    - The `constants.mdx` file can also have functions to manipulate some parameters prior to being injected into the `.mdx` file. It should be noted however that in order to use the data returned by a function in a property of a JSX tag (i.e. in the `href` property of an `<a>` tag) that it should be called at the top of the `.mdx` file and stored to its own, local variable. For example:

    ```md
    <!-- !!!DO THIS!!! -->

    import { doSomethingCool } from '../constants.mdx';

    export const parsedCool = doSomethingCool('veryCool');

    <a href={parsedCool}>cool</a>

    <!-- !!!DO NOT DO THIS!!! -->

    import { doSomethingCool } from '../constants.mdx';

    <a href={doSomethingCool('veryCool')}>cool</a>
    ```

Lastly when writing guides we highly recommend that you use the [VSCode] editor and install the following extensions. This will allow you to get both syntax highlighting as well as live preview.

1. [MDX][mdx-vscode]
2. [MDX Preview][]

## Contributing to the code

**The issue tracker is only for issue reporting or proposals/suggestions. If you have a question, you can find us in our [Discord Server]**.

To contribute to this repository, feel free to create a new fork of the repository and
submit a pull request. We highly suggest [ESLint] to be installed
in your text editor or IDE of your choice to ensure builds from GitHub Actions do not fail.

**_Before committing and pushing your changes, please ensure that you do not have any linting errors by running `yarn lint`!_**

### @sapphire/framework Concept Guidelines

There are a number of guidelines considered when reviewing Pull Requests to be merged. _This is by no means an exhaustive list, but here are some things to consider before/while submitting your ideas._

-   Everything in @sapphire/framework should be generally useful for the majority of users. Don't let that stop you if you've got a good concept though, as your idea still might be a great addition.
-   Everything should be shard compliant. If code you put in a pull request would break when sharding, break other things from supporting sharding, or is incompatible with sharding; then you will need to think of a way to make it work with sharding in mind before the pull request will be accepted and merged.
-   Everything should follow [OOP paradigms] and generally rely on behaviour over state where possible. This generally helps methods be predictable, keeps the codebase simple and understandable, reduces code duplication through abstraction, and leads to efficiency and therefore scalability.
-   Everything should follow our ESLint rules as closely as possible, and should pass lint tests even if you must disable a rule for a single line.
-   Scripts that are to be ran outside of the scope of the bot should be added to [scripts] directory and should be in the `.mjs` file format.

<!-- Link Dump -->

<!-- Guides -->

[mdx-vscode]: https://marketplace.visualstudio.com/items?itemName=silvenon.mdx
[mdx preview]: https://marketplace.visualstudio.com/items?itemName=xyc.vscode-mdx-preview
[mdx]: https://mdxjs.com
[mdx documentation]: https://mdxjs.com/getting-started
[vscode]: https://code.visualstudio.com

<!-- Code -->

[discord server]: https://join.skyra.pw/sapphire
[here]: https://github.com/sapphire-project/framework/pulls
[eslint]: https://eslint.org/
[node.js]: https://nodejs.org/en/download/
[yarn]: https://classic.yarnpkg.com/en/docs/install
[oop paradigms]: https://en.wikipedia.org/wiki/Object-oriented_programming
[scripts]: /scripts
