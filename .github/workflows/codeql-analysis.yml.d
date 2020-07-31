name: Code Scanning

on:
    push:
        branches:
            - main
    pull_request:
    schedule:
        - cron: '0 8 * * 1'

jobs:
    CodeQL:
        runs-on: ubuntu-latest

        steps:
            - name: Checkout repository
              uses: actions/checkout@v2
              with:
                  # We must fetch at least the immediate parents so that if this is
                  # a pull request then we can checkout the head.
                  fetch-depth: 2

            # If this run was triggered by a pull request event, then checkout
            # the head of the pull request instead of the merge commit.
            - run: git checkout HEAD^2
              if: ${{ github.event_name == 'pull_request' }}

            # Initializes the CodeQL tools for scanning.
            - name: Initialize CodeQL
              uses: github/codeql-action/init@v1

            # Autobuild attempts to build any compiled languages  (C/C++, C#, or Java).
            # If this step fails, then you should remove it and run the build manually (see below)
            - name: Autobuild
              uses: github/codeql-action/autobuild@v1

            - name: Perform CodeQL Analysis
              uses: github/codeql-action/analyze@v1
