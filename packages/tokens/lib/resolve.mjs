/**
 * Resolve all DTCG token references (e.g. "{color.primitive.white}") within a
 * flat or nested token tree.
 *
 * @param {Record<string, unknown>} tokens - The full token tree
 * @returns {Record<string, unknown>} A new token tree with all $value references resolved
 */
export function resolveRefs(tokens) {
  /**
   * Get the raw $value at a dot-separated path in the token tree.
   * Returns undefined if not found.
   */
  function getRaw(path) {
    const parts = path.split(".");
    let node = tokens;
    for (const part of parts) {
      if (node == null || typeof node !== "object") return undefined;
      node = node[part];
    }
    if (node != null && typeof node === "object" && "$value" in node) {
      return node.$value;
    }
    return undefined;
  }

  const REFERENCE_RE = /^\{([^}]+)\}$/;

  /**
   * Resolve a single value, following reference chains.
   * @param {unknown} value
   * @param {Set<string>} visiting - paths currently being resolved (cycle detection)
   * @returns {unknown}
   */
  function resolveValue(value, visiting = new Set()) {
    if (typeof value !== "string") return value;

    const match = value.match(REFERENCE_RE);
    if (!match) return value;

    const refPath = match[1];

    if (visiting.has(refPath)) {
      throw new Error(`Circular reference detected: ${refPath}`);
    }

    const raw = getRaw(refPath);
    if (raw === undefined) {
      throw new Error(`Missing reference: ${refPath}`);
    }

    visiting.add(refPath);
    const resolved = resolveValue(raw, visiting);
    visiting.delete(refPath);

    return resolved;
  }

  /**
   * Walk the entire token tree and resolve $value fields.
   */
  function walk(node) {
    if (node == null || typeof node !== "object") return node;

    const result = {};
    for (const [key, val] of Object.entries(node)) {
      if (key === "$value") {
        result[key] = resolveValue(val);
      } else {
        result[key] = walk(val);
      }
    }
    return result;
  }

  return walk(tokens);
}
