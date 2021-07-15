# Contributing to the s12r

We work hard to provide a useful s12r, and we greatly value
feedback and contributions from our community. Whether it's a bug report,
new feature, correction, or additional documentation, we welcome your issues
and pull requests. Please read through this document before submitting any
issues or pull requests to ensure we have all the necessary information to
effectively respond to your bug report or contribution.

## Filing Bug Reports

You can file bug reports against the s12r on the [GitHub issues][issues] page.

If you are filing a report for a bug or regression in the s12r, it's extremely
helpful to provide as much information as possible when opening the original
issue. This helps us reproduce and investigate the possible bug without having
to wait for this extra information to be provided. Please read the following
guidelines prior to filing a bug report.

1. Search through existing [issues][] to ensure that your specific issue has
   not yet been reported. If it is a common issue, it is likely there is
   already a bug report for your problem.

2. Ensure that you have tested the latest version of the s12r. Although you
   may have an issue against an older version of the s12r, we cannot provide
   bug fixes for old versions. It's also possible that the bug may have been
   fixed in the latest release.

3. Provide as much information about your environment, s12r version, and
   relevant dependencies as possible. For example, let us know what version
   of Node.js you are using, or if it's a browser issue, which browser you
   are using. If the issue only occurs with a specific dependency loaded,
   please provide that dependency name and version.

4. Provide a minimal test case that reproduces your issue or any error
   information you related to your problem. We can provide feedback much
   more quickly if we know what operations you are calling in the s12r. If
   you cannot provide a full test case, provide as much code as you can
   to help us diagnose the problem. Any relevant information should be provided
   as well, like whether this is a persistent issue, or if it only occurs
   some of the time.

## Submitting Pull Requests

We are always happy to receive code and documentation contributions to the s12r.
Please be aware of the following notes prior to opening a pull request:

1. The s12r is released under the [MIT license][license]. Any code you submit
   will be released under that license. For substantial contributions, we may
   ask you to sign a [Contributor License Agreement (CLA)][cla].

2. If you would like to implement support for a significant feature that is not
   yet available in the s12r, please talk to us beforehand to avoid any
   duplication of effort.

3. Wherever possible, pull requests should contain tests as appropriate.
   Bugfixes should contain tests that exercise the corrected behavior (i.e., the
   test should fail without the bugfix and pass with it), and new features
   should be accompanied by tests exercising the feature.

4. Pull requests that contain failing tests will not be merged until the test
   failures are addressed. Pull requests that cause a significant drop in the
   s12r's test coverage percentage are unlikely to be merged until tests have
   been added.

[issues]: https://github.com/satheler/s12r/issues
[pr]: https://github.com/satheler/s12r/pulls
[license]: https://github.com/satheler/s12r/blob/main/LICENSE
[cla]: http://en.wikipedia.org/wiki/Contributor_License_Agreement
