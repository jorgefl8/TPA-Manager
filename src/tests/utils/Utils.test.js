import { parseJsonEditorContent, deepFindKeyword } from "@/utils/utils"

describe("parseJsonEditorContent", () => {
  test("should return the content if it is not a string", () => {
    expect(parseJsonEditorContent({a: 1})).toEqual({ a: 1 });
    expect(parseJsonEditorContent(1)).toEqual(1);
    expect(parseJsonEditorContent(true)).toEqual(true);
    expect(parseJsonEditorContent(null)).toBeNull();
    expect(parseJsonEditorContent(undefined)).toBeUndefined();
  });

  test("should return the content if it is a valid JSON string", () => {
    const json1 = '{"a": 1}'
    const json2 = '{\n  "a": 1,\n  "b": 2,\n  "c": 3\n}'
    const nestedJson1 = '{"a": {"b": {"c": "d"}}}'
    const nestedJson2 = '{\n  "a": {\n    "b": {\n      "c": "d"\n    }\n  }\n}'

    expect(parseJsonEditorContent(json1)).toEqual({ a: 1 });
    expect(parseJsonEditorContent(json2)).toEqual({ a: 1, b: 2, c: 3 });
    expect(parseJsonEditorContent(nestedJson1)).toEqual({ a: { b: { c: "d" } } });
    expect(parseJsonEditorContent(nestedJson2)).toEqual({ a: { b: { c: "d" } } });
  });

  test("should throw an error if the content is not a valid JSON string", () => {
    expect(() => parseJsonEditorContent("invalid JSON")).toThrow("Unexpected token i in JSON at position 0");
  });
  
  test("should throw an error if the content is an empty string", () => {
    expect(() => parseJsonEditorContent("")).toThrow("Unexpected end of JSON input");
  });
})

describe("deepFindKeyword", () => {

  const obj = {
    a: {
      b: {
        c: "d",
      },
    },
  }
  
  test("should return the value of the keyword", () => {
    expect(deepFindKeyword("c", obj)).toEqual("d")
  });

  test("should return undefined if the keyword is not found", () => {
    expect(deepFindKeyword("e", obj)).toEqual(undefined)
  });

  test("should return undefined if the object is not an object", () => {
    expect(deepFindKeyword("e", "not an object")).toEqual(undefined)
  });

  test("should return undefined if the object is null", () => {
    expect(deepFindKeyword("e", null)).toEqual(undefined)
  });

})