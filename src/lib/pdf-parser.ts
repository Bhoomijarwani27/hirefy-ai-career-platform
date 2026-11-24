import zlib from "zlib";

/**
 * Universal PDF Text Extractor.
 * Robust FlateDecode decompression, proper operator boundaries (\bBT\b ... \bET\b),
 * CMap translation, hex decode (ASCII & UTF-16BE), and literal string decode.
 */

// Decode PDF octal & escape sequences in literal strings
function decodeLiteralPdfString(raw: string): string {
  // Check for UTF-16BE BOM: \xFE\xFF or \u00FE\u00FF
  if (raw.startsWith("\xfe\xff") || raw.startsWith("\u00fe\u00ff")) {
    const bytes = Buffer.from(raw, "latin1");
    try {
      return bytes.subarray(2).swap16().toString("utf16le").replace(/\0/g, "");
    } catch {
      return bytes.toString("latin1");
    }
  }

  let result = "";
  let i = 0;
  const len = raw.length;

  while (i < len) {
    const c = raw[i];
    if (c === "\\" && i + 1 < len) {
      const next = raw[i + 1];
      if (next >= "0" && next <= "7") {
        let octStr = next;
        let j = i + 2;
        while (j < len && j < i + 4 && raw[j] >= "0" && raw[j] <= "7") {
          octStr += raw[j];
          j++;
        }
        result += String.fromCharCode(parseInt(octStr, 8));
        i = j;
        continue;
      }
      switch (next) {
        case "n":
          result += "\n";
          break;
        case "r":
          result += "\r";
          break;
        case "t":
          result += "\t";
          break;
        case "b":
          result += "\b";
          break;
        case "f":
          result += "\f";
          break;
        case "(":
          result += "(";
          break;
        case ")":
          result += ")";
          break;
        case "\\":
          result += "\\";
          break;
        default:
          result += next;
      }
      i += 2;
    } else {
      result += c;
      i++;
    }
  }

  return result;
}

// Decode hex string <4A6F686E> or <004A006F0068006E> with optional CMap
function decodeHexPdfString(hex: string, cmap?: Map<string, string>): string {
  const cleanHex = hex.replace(/[^0-9a-fA-F]/g, "");
  if (!cleanHex) return "";

  const padded = cleanHex.length % 2 !== 0 ? cleanHex + "0" : cleanHex;

  // 1. Check CMap first
  if (cmap && cmap.size > 0) {
    if (padded.length % 4 === 0) {
      let cmapResult = "";
      let matchedAny = false;
      let allFound = true;
      for (let i = 0; i < padded.length; i += 4) {
        const key = padded.slice(i, i + 4).toUpperCase();
        if (cmap.has(key)) {
          cmapResult += cmap.get(key);
          matchedAny = true;
        } else {
          allFound = false;
          break;
        }
      }
      if (allFound && matchedAny) return cmapResult;
    }

    if (padded.length % 2 === 0) {
      let temp = "";
      let matchedAny = false;
      let allFound = true;
      for (let i = 0; i < padded.length; i += 2) {
        const key = padded.slice(i, i + 2).toUpperCase();
        if (cmap.has(key)) {
          temp += cmap.get(key);
          matchedAny = true;
        } else {
          allFound = false;
          break;
        }
      }
      if (allFound && matchedAny) return temp;
    }
  }

  const buf = Buffer.from(padded, "hex");

  // 2. Check UTF-16BE BOM: FE FF
  if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) {
    try {
      return buf.subarray(2).swap16().toString("utf16le").replace(/\0/g, "");
    } catch {}
  }

  // 3. Detect 2-byte UTF-16BE without BOM (alternating zero bytes, e.g. 00 48 00 65...)
  if (buf.length >= 4 && buf[0] === 0x00 && buf[2] === 0x00) {
    try {
      const swapped = Buffer.from(buf);
      swapped.swap16();
      const decoded = swapped.toString("utf16le").replace(/\0/g, "");
      if (decoded.length > 0 && /[a-zA-Z0-9]/.test(decoded)) {
        return decoded;
      }
    } catch {}
  }

  // 4. Standard Latin1 / ASCII fallback
  return buf.toString("latin1");
}

// Parse /ToUnicode CMaps across all decompressed streams
function extractCMapMappings(streamStr: string): Map<string, string> {
  const cmap = new Map<string, string>();

  // Parse beginbfchar ... endbfchar
  const bfCharRegex = /beginbfchar[\s\S]*?endbfchar/gi;
  let match: RegExpExecArray | null;
  while ((match = bfCharRegex.exec(streamStr)) !== null) {
    const block = match[0];
    const pairRegex = /<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g;
    let pair: RegExpExecArray | null;
    while ((pair = pairRegex.exec(block)) !== null) {
      const src = pair[1].toUpperCase();
      const dstHex = pair[2];
      try {
        const dstBuf = Buffer.from(dstHex, "hex");
        const char =
          dstBuf.length >= 2
            ? dstBuf.swap16().toString("utf16le")
            : dstBuf.toString("latin1");
        cmap.set(src, char);
      } catch {}
    }
  }

  // Parse beginbfrange ... endbfrange
  const bfRangeRegex = /beginbfrange[\s\S]*?endbfrange/gi;
  while ((match = bfRangeRegex.exec(streamStr)) !== null) {
    const block = match[0];
    const rangeRegex = /<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g;
    let rangeMatch: RegExpExecArray | null;
    while ((rangeMatch = rangeRegex.exec(block)) !== null) {
      const startCode = parseInt(rangeMatch[1], 16);
      const endCode = parseInt(rangeMatch[2], 16);
      const targetBase = parseInt(rangeMatch[3], 16);
      const keyLen = rangeMatch[1].length;

      for (let c = startCode; c <= endCode; c++) {
        const key = c.toString(16).padStart(keyLen, "0").toUpperCase();
        const char = String.fromCharCode(targetBase + (c - startCode));
        cmap.set(key, char);
      }
    }
  }

  return cmap;
}

// Extract text from stream using word-boundary operators: \bBT\b ... \bET\b
function extractTextFromStream(streamStr: string, cmap: Map<string, string>): string {
  const lines: string[] = [];

  // Match only genuine BT ... ET blocks using word boundaries!
  // Prevents stopping at words like TARGET, MARKET, STREET, INTERNET
  const btRegex = /(?:^|\s)BT\b([\s\S]*?)\bET(?:\s|$)/g;
  let btMatch: RegExpExecArray | null;

  while ((btMatch = btRegex.exec(streamStr)) !== null) {
    const block = btMatch[1];
    let currentLine = "";

    // Parse operators inside block
    const opRegex = /(?:\((?:\\.|[^()\\])*\)\s*Tj)|(?:\((?:\\.|[^()\\])*\)\s*')|(?:<[0-9a-fA-F\s]+>\s*Tj)|(?:<[0-9a-fA-F\s]+>\s*')|(?:\[([\s\S]*?)\]\s*TJ)|(?:T\*)|(?:-?\d+(?:\.\d+)?\s+-?\d+(?:\.\d+)?\s+(?:Td|TD))/g;

    let opMatch: RegExpExecArray | null;
    while ((opMatch = opRegex.exec(block)) !== null) {
      const op = opMatch[0].trim();

      // Line break operators
      if (op === "T*") {
        if (currentLine.trim()) {
          lines.push(currentLine.trim());
          currentLine = "";
        }
        continue;
      }
      if (op.endsWith("Td") || op.endsWith("TD")) {
        const coords = op.split(/\s+/);
        const ty = parseFloat(coords[1]);
        if (Math.abs(ty) > 2) {
          if (currentLine.trim()) {
            lines.push(currentLine.trim());
            currentLine = "";
          }
        }
        continue;
      }

      // Literal string: (text) Tj or '
      if (op.startsWith("(") && (op.endsWith("Tj") || op.endsWith("'"))) {
        const inner = op.slice(1, op.lastIndexOf(")"));
        const decoded = decodeLiteralPdfString(inner);
        currentLine += (currentLine ? " " : "") + decoded;
        if (op.endsWith("'")) {
          lines.push(currentLine.trim());
          currentLine = "";
        }
        continue;
      }

      // Hex string: <4A6F686E> Tj or '
      if (op.startsWith("<") && (op.endsWith("Tj") || op.endsWith("'"))) {
        const hex = op.slice(1, op.lastIndexOf(">"));
        const decoded = decodeHexPdfString(hex, cmap);
        currentLine += (currentLine ? " " : "") + decoded;
        if (op.endsWith("'")) {
          lines.push(currentLine.trim());
          currentLine = "";
        }
        continue;
      }

      // TJ array: [(...) -10 <...>] TJ
      if (op.startsWith("[") && op.endsWith("TJ")) {
        const arrayBody = op.slice(1, op.lastIndexOf("]"));
        const itemRegex = /(?:\((?:\\.|[^()\\])*\))|(?:<[0-9a-fA-F\s]+>)|(-?\d+(?:\.\d+)?)/g;
        let itemMatch: RegExpExecArray | null;
        let tjChunk = "";

        while ((itemMatch = itemRegex.exec(arrayBody)) !== null) {
          const item = itemMatch[0];
          if (item.startsWith("(")) {
            const inner = item.slice(1, -1);
            tjChunk += decodeLiteralPdfString(inner);
          } else if (item.startsWith("<")) {
            const hex = item.slice(1, -1);
            tjChunk += decodeHexPdfString(hex, cmap);
          } else {
            const spaceNum = parseFloat(item);
            if (spaceNum < -100) {
              tjChunk += " ";
            }
          }
        }

        if (tjChunk.trim()) {
          currentLine += (currentLine ? " " : "") + tjChunk.trim();
        }
      }
    }

    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }
  }

  // If word-boundary BT ... ET blocks found lines, return them
  if (lines.length > 0) {
    return lines.join("\n");
  }

  // Fallback: search for all strings inside parentheses and hex tags followed by Tj or TJ
  const directOpRegex = /(?:\((.*?)\)|<([0-9a-fA-F\s]+)>)\s*(?:Tj|'|TJ)/g;
  let directMatch: RegExpExecArray | null;
  const directLines: string[] = [];
  let dLine = "";

  while ((directMatch = directOpRegex.exec(streamStr)) !== null) {
    if (directMatch[1]) {
      const decoded = decodeLiteralPdfString(directMatch[1]);
      dLine += (dLine ? " " : "") + decoded;
    } else if (directMatch[2]) {
      const decoded = decodeHexPdfString(directMatch[2], cmap);
      dLine += (dLine ? " " : "") + decoded;
    }
    if (dLine.length > 80 || dLine.endsWith(".") || dLine.endsWith(":")) {
      directLines.push(dLine.trim());
      dLine = "";
    }
  }
  if (dLine.trim()) directLines.push(dLine.trim());

  return directLines.join("\n");
}

/**
 * Universal PDF Text Extraction
 */
export function extractTextFromPdfBuffer(pdfBuffer: Buffer): string {
  if (!pdfBuffer || pdfBuffer.length === 0) return "";

  const streamBuffers: Buffer[] = [];
  const bufferLen = pdfBuffer.length;

  let pos = 0;
  while (pos < bufferLen) {
    const streamStartKeyword = Buffer.from("stream");
    const streamIdx = pdfBuffer.indexOf(streamStartKeyword, pos);
    if (streamIdx === -1) break;

    // Detect line break after "stream"
    let dataStart = streamIdx + 6;
    if (pdfBuffer[dataStart] === 0x0d && pdfBuffer[dataStart + 1] === 0x0a) {
      dataStart += 2;
    } else if (pdfBuffer[dataStart] === 0x0a || pdfBuffer[dataStart] === 0x0d) {
      dataStart += 1;
    }

    const endstreamKeyword = Buffer.from("endstream");
    const endstreamIdx = pdfBuffer.indexOf(endstreamKeyword, dataStart);
    if (endstreamIdx === -1) break;

    let dataEnd = endstreamIdx;
    while (dataEnd > dataStart && (pdfBuffer[dataEnd - 1] === 0x0a || pdfBuffer[dataEnd - 1] === 0x0d)) {
      dataEnd--;
    }

    const streamSlice = pdfBuffer.subarray(dataStart, dataEnd);

    // Try various zlib decompression strategies:
    let decompressed: Buffer | null = null;
    try {
      decompressed = zlib.inflateSync(streamSlice);
    } catch {
      try {
        decompressed = zlib.inflateRawSync(streamSlice);
      } catch {
        try {
          decompressed = zlib.unzipSync(streamSlice);
        } catch {
          decompressed = streamSlice;
        }
      }
    }

    if (decompressed && decompressed.length > 0) {
      streamBuffers.push(decompressed);
    }

    pos = endstreamIdx + 9;
  }

  // 1. Extract CMaps across all decompressed streams
  const globalCMap = new Map<string, string>();
  for (const streamBuf of streamBuffers) {
    const streamStr = streamBuf.toString("latin1");
    if (streamStr.includes("beginbfchar") || streamStr.includes("beginbfrange")) {
      const cmap = extractCMapMappings(streamStr);
      for (const [k, v] of cmap.entries()) {
        globalCMap.set(k, v);
      }
    }
  }

  // 2. Extract structured text using PDF operators
  const extractedChunks: string[] = [];
  for (const streamBuf of streamBuffers) {
    const streamStr = streamBuf.toString("latin1");
    if (streamStr.includes("Tj") || streamStr.includes("TJ") || streamStr.includes("BT")) {
      const text = extractTextFromStream(streamStr, globalCMap);
      if (text.trim().length > 5) {
        extractedChunks.push(text.trim());
      }
    }
  }

  if (extractedChunks.length > 0) {
    return cleanPdfExtractedText(extractedChunks.join("\n\n"));
  }

  // 3. Fallback: Extract all printable words (ASCII >= 3 chars) from all decompressed streams
  const fallbackLines: string[] = [];
  for (const streamBuf of streamBuffers) {
    const str = streamBuf.toString("latin1");
    // Match literal parens
    const parens = str.match(/\(((?:\\.|[^()\\]){2,})\)/g);
    if (parens) {
      const decoded = parens.map((p) => decodeLiteralPdfString(p.slice(1, -1)).trim()).filter((s) => s.length >= 2);
      if (decoded.length > 0) {
        fallbackLines.push(decoded.join(" "));
      }
    }
    // Match hex sequences
    const hexes = str.match(/<([0-9a-fA-F]{4,})>/g);
    if (hexes) {
      const decoded = hexes.map((h) => decodeHexPdfString(h.slice(1, -1), globalCMap).trim()).filter((s) => s.length >= 2 && /[a-zA-Z]/.test(s));
      if (decoded.length > 0) {
        fallbackLines.push(decoded.join(" "));
      }
    }
  }

  if (fallbackLines.length > 0) {
    return cleanPdfExtractedText(fallbackLines.join("\n\n"));
  }

  // 4. Raw PDF buffer scan
  const rawStr = pdfBuffer.toString("latin1");
  const rawParens = rawStr.match(/\(((?:\\.|[^()\\]){3,})\)/g);
  if (rawParens) {
    const words = rawParens.map((p) => decodeLiteralPdfString(p.slice(1, -1)).trim()).filter((s) => s.length >= 2 && /[a-zA-Z]/.test(s));
    if (words.length > 0) {
      return cleanPdfExtractedText(words.join(" "));
    }
  }

  return "";
}

function cleanPdfExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/(\n\s*){3,}/g, "\n\n")
    .trim();
}
