// @flow

import * as fs from "fs";

export class DefinitionNotFoundError {
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}

export type ModelTypeInfo =
  | {
      formattedDefinition: string,
      associatedTypeNames: Array<string>
    }
  | DefinitionNotFoundError;

function getTypeDefinitionRawString(
  typeName: string,
  allDefStr: string
): string | DefinitionNotFoundError {
  const defSearchKeyword = `export type ${typeName}`;
  let typeDefStartIndex = -1;
  let typeDefEndIndex = -1;
  let typeDefStrIterator = allDefStr.search(defSearchKeyword);

  if (typeDefStrIterator === -1) {
    return new DefinitionNotFoundError(`Type ${typeName} not found.`);
  }

  while (typeDefStartIndex === -1 || typeDefEndIndex === -1) {
    const currentCharacter = allDefStr.slice(
      typeDefStrIterator,
      typeDefStrIterator + 1
    );
    if (typeDefStrIterator === allDefStr.length) {
      break;
    }
    if (currentCharacter === "{") {
      typeDefStartIndex = typeDefStrIterator;
    }
    if (currentCharacter === "}") {
      typeDefEndIndex = typeDefStrIterator;
    }
    typeDefStrIterator++;
  }

  if (typeDefStartIndex === -1 || typeDefEndIndex === -1) {
    return new DefinitionNotFoundError(
      `Definition of ${typeName} is insufficient.`
    );
  }

  return allDefStr.slice(typeDefStartIndex, typeDefEndIndex + 1);
}

function getNonPrimitiveTypeNamesOfField(line: string): string[] {
  const fieldDefinitionStr = line.slice(line.search(":") + 2, line.length);
  const primitiveTypes = [
    "null",
    "Date",
    "number",
    "boolean",
    "string",
    "Array",
    ""
  ];

  return fieldDefinitionStr
    .split(/[<\s,>|]/)
    .filter((subType) => !primitiveTypes.includes(subType));
}

function getTypeInfoFromRawDefinition(rawDefinition: string): ModelTypeInfo {
  const linesOfDefinition = rawDefinition
    .split("\n")
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.search(/\/\*\*/g) === -1 &&
        line.search(/\*/g) === -1 &&
        line.search(/\*\*\//g) === -1
    );

  const formattedDefinition =
    "{\n\t" +
    linesOfDefinition.slice(1, linesOfDefinition.length - 1).join(",\n\t") +
    "\n}";

  const associatedTypeNames = {};
  linesOfDefinition.slice(1, linesOfDefinition.length - 1).forEach((line) => {
    getNonPrimitiveTypeNamesOfField(line).forEach((subType) => {
      associatedTypeNames[subType] = subType;
    });
  });

  return {
    formattedDefinition,
    associatedTypeNames: Object.keys(associatedTypeNames)
  };
}

export function extractTypeInfo(typeName: string): ModelTypeInfo {
  const allDefStr = fs.readFileSync(
    "./node_modules/.prisma/client/index.d.ts",
    "utf8"
  );

  const typeDefStr = getTypeDefinitionRawString(typeName, allDefStr);

  if (typeDefStr instanceof DefinitionNotFoundError) {
    return typeDefStr;
  }

  return getTypeInfoFromRawDefinition(typeDefStr);
}
