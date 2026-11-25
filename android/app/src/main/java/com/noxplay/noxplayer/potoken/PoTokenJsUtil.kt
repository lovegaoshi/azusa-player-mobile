package com.noxplay.noxplayer.potoken

import com.grack.nanojson.JsonObject
import com.grack.nanojson.JsonParser
import com.grack.nanojson.JsonWriter
import okio.ByteString.Companion.decodeBase64
import okio.ByteString.Companion.toByteString
import java.util.regex.Pattern

/**
 * Parses the V2 (`bgChallenge`) challenge into a JS object literal that can be embedded directly in
 * `evaluateJavascript()`. Ported from SmartTube/BgUtils.
 */
internal fun parseDescrambledChallengeData(rawChallengeData: String): String {
    val root = JsonParser.`object`().from(rawChallengeData)
    val bgChallenge = root.getObject("bgChallenge")

    val interpreterPath =
        bgChallenge
            .getObject("interpreterUrl")
            .getString("privateDoNotAccessOrElseTrustedResourceUrlWrappedValue")
    val interpreterJavascript =
        PoTokenHttp.get("https:$interpreterPath")

    return JsonWriter.string(
        JsonObject
            .builder()
            .`object`("interpreterJavascript")
            .value("privateDoNotAccessOrElseSafeScriptWrappedValue", interpreterJavascript)
            .value("privateDoNotAccessOrElseTrustedResourceUrlWrappedValue", interpreterPath)
            .end()
            .value("interpreterHash", bgChallenge.getString("interpreterHash"))
            .value("program", bgChallenge.getString("program"))
            .value("globalName", bgChallenge.getString("globalName"))
            .value("clientExperimentsStateBlob", bgChallenge.getString("clientExperimentsStateBlob"))
            .done(),
    )
}

/**
 * The homepage `window.ytAtN({...})` payload is a JS object literal rather than strict JSON.
 * Vendored from BgUtils v4.0.3 (MIT) via SmartTube.
 */
internal fun parseLooseJSON(looseJson: String): Map<String, String> {
    val hexPattern = Pattern.compile("""\\x([0-9A-Fa-f]{2})""")
    val hexMatcher = hexPattern.matcher(looseJson)

    val sanitizedString =
        buildString {
            var lastEnd = 0
            while (hexMatcher.find()) {
                append(looseJson, lastEnd, hexMatcher.start())
                append(hexMatcher.group(1)!!.toInt(16).toChar())
                lastEnd = hexMatcher.end()
            }
            append(looseJson, lastEnd, looseJson.length)
        }

    val trailingCommaPattern = Pattern.compile(""",\s*([\]}])""")
    var jsonStr = trailingCommaPattern.matcher(sanitizedString).replaceAll("$1")

    val singleQuotePattern = Pattern.compile("""'((?:[^'\\]|\\[\s\S])*)'""")
    val singleQuoteMatcher = singleQuotePattern.matcher(jsonStr)

    jsonStr =
        buildString {
            var lastEnd = 0
            while (singleQuoteMatcher.find()) {
                append(jsonStr, lastEnd, singleQuoteMatcher.start())
                append(quoteJson(singleQuoteMatcher.group(1)!!.replace("""\'""", "'")))
                lastEnd = singleQuoteMatcher.end()
            }
            append(jsonStr, lastEnd, jsonStr.length)
        }

    val unquotedKeyPattern = Pattern.compile("""([{,]\s*)([a-zA-Z0-9_$]+)\s*:""")
    jsonStr = unquotedKeyPattern.matcher(jsonStr).replaceAll("""$1"$2":""")

    val parsedData = JsonParser.`object`().from(jsonStr)
    val result = LinkedHashMap<String, String>()
    for ((key, value) in parsedData) {
        result[key] = value?.toString() ?: "null"
    }
    return result
}

private fun quoteJson(value: String): String =
    buildString {
        append('"')
        for (char in value) {
            when (char) {
                '\\' -> append("\\\\")
                '"' -> append("\\\"")
                '\b' -> append("\\b")
                '\u000C' -> append("\\f")
                '\n' -> append("\\n")
                '\r' -> append("\\r")
                '\t' -> append("\\t")
                else -> {
                    if (char.code < 0x20) {
                        append("\\u00")
                        append("0123456789abcdef"[char.code ushr 4])
                        append("0123456789abcdef"[char.code and 0x0F])
                    } else {
                        append(char)
                    }
                }
            }
        }
        append('"')
    }

/** Parses the GenerateIT response into a JS `Uint8Array` expression and a TTL in seconds. */
internal fun parseIntegrityTokenData(rawIntegrityTokenData: String): Pair<String, Long> {
    val integrityTokenData = JsonParser.array().from(rawIntegrityTokenData)
    return base64ToU8(integrityTokenData.getString(0)) to integrityTokenData.getLong(1)
}

/** Converts an identifier (visitorData or videoId) into a JS `Uint8Array` expression. */
internal fun stringToU8(identifier: String): String = newUint8Array(identifier.toByteArray())

/** Converts comma-separated JS bytes into the URL-safe base64 representation YouTube expects. */
internal fun u8ToBase64(poToken: String): String =
    poToken
        .split(",")
        .map { it.toUByte().toByte() }
        .toByteArray()
        .toByteString()
        .base64()
        .replace("+", "-")
        .replace("/", "_")

private fun base64ToU8(base64: String): String = newUint8Array(base64ToByteString(base64))

private fun newUint8Array(contents: ByteArray): String =
    "new Uint8Array([" + contents.joinToString(separator = ",") { it.toUByte().toString() } + "])"

private fun base64ToByteString(base64: String): ByteArray {
    val base64Mod =
        base64
            .replace('-', '+')
            .replace('_', '/')
            .replace('.', '=')

    return (base64Mod.decodeBase64() ?: throw PoTokenException("Cannot base64 decode"))
        .toByteArray()
}
