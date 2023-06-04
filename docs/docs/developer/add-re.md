---
sidebar_position: 3
---

# Add New regexp for Song Name Parsing

APM uses regexp to extract song names out of bilibili video titles. The regexp list is simply in a giant switch loop in `re.ts`. See example below:

```
case '{song.singerID you'd like to target; for bilibili, this is a user's mid}': // "冥侦探柯镇恶":
    filename = extractParenthesis(
    extractWith(filename, [
        regexp1, // note each regexp must have an extraction group in parenthesis
        regexp2,
        ...
    ])
    );
    break;
```
