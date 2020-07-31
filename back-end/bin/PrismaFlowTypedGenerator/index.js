// @flow

import * as Prisma from "@prisma/client";
import * as fs from "fs";
import {
  extractTypeInfo,
  DefinitionNotFoundError
} from "./ModelTypeDefExtractor";
// We only need DMMF for this file and may not need flow-typed for @prisma/client/runtime
// $FlowFixMe
import { DMMF } from "@prisma/client/runtime";

// We are generating flow-typed for Prisma, so we should not do flow check here
// $FlowFixMe
const mModelMappings: DMMF.Mapping[] = Prisma.dmmf.mappings;

let mModuleDeclaration = "declare module '@prisma/client' {\n}";
function addDeclaration(declarationText: string): void {
  const insertPosition = mModuleDeclaration.length - 1;
  mModuleDeclaration = [
    mModuleDeclaration.slice(0, insertPosition),
    `${declarationText}\n\n`,
    mModuleDeclaration.slice(insertPosition)
  ].join("");
}

let mPrismaClientDeclaration = "\tdeclare class PrismaClient {\n\t}";
function addModelDeclarationToPrismaClient(
  model: string,
  plural: string
): void {
  const insertPosition = mPrismaClientDeclaration.length - 2;
  mPrismaClientDeclaration = [
    mPrismaClientDeclaration.slice(0, insertPosition),
    `\t\t${plural.slice(0, plural.length - 1)}: ${model}Delegate,\n`,
    mPrismaClientDeclaration.slice(insertPosition)
  ].join("");
}
mModelMappings.forEach((modelMapping) => {
  addModelDeclarationToPrismaClient(modelMapping.model, modelMapping.plural);
});

const mDelegateActionArgsMappings = {
  findOne: "FindOne$Args",
  findMany: "FindMany$Args",
  create: "$CreateArgs",
  delete: "$DeleteArgs",
  update: "$UpdateArgs",
  deleteMany: "$DeleteManyArgs",
  updateMany: "$UpdateManyArgs",
  upsert: "$UpsertArgs",
  count: "Omit<FindMany$Args, 'select' | 'include'>"
};
function getDelegateDeclaration(model: string): string {
  let mDelegateDeclaration = `\tdeclare interface ${model}Delegate {\n\t}`;

  function addActionDeclarationToDelegate(action: string, model: string): void {
    const insertPosition = mDelegateDeclaration.length - 2;
    const actionArgsName = mDelegateActionArgsMappings[action].replace(
      "$",
      model
    );
    mDelegateDeclaration = [
      mDelegateDeclaration.slice(0, insertPosition),
      `\t\t${action}(args: ${actionArgsName}): Promise<any>,\n`,
      mDelegateDeclaration.slice(insertPosition)
    ].join("");
  }

  Object.keys(mDelegateActionArgsMappings).forEach((action) => {
    addActionDeclarationToDelegate(action, model);
  });

  return mDelegateDeclaration;
}

const mArgsListOfDelegate = [
  "FindOne$Args",
  "FindMany$Args",
  "$CreateArgs",
  "$DeleteArgs",
  "$UpdateArgs",
  "$DeleteManyArgs",
  "$UpdateManyArgs",
  "$UpsertArgs",
  "$Args"
];
function addRemainingDeclarations(): void {
  const typeNameQueue: string[] = [];
  const addedDeclarationList: { [string]: string } = {};
  mModelMappings.forEach((modelMapping) => {
    mArgsListOfDelegate.forEach((argsName) => {
      typeNameQueue.push(argsName.replace("$", modelMapping.model));
    });
  });

  while (typeNameQueue.length > 0) {
    const currentTypeName = typeNameQueue.shift();
    if (
      Object.prototype.hasOwnProperty.call(
        addedDeclarationList,
        currentTypeName
      )
    ) {
      continue;
    }

    if (currentTypeName === "OrderByArg") {
      addDeclaration("declare type OrderByArg = 'asc' | 'desc'");
      addedDeclarationList[currentTypeName] = currentTypeName;
      continue;
    } else if (currentTypeName === "Enumerable") {
      addDeclaration("declare type Enumerable<T> = T | Array<T>");
      addedDeclarationList[currentTypeName] = currentTypeName;
      continue;
    }

    const typeInfo = extractTypeInfo(currentTypeName);
    if (typeInfo instanceof DefinitionNotFoundError) {
      console.log(typeInfo.message);
      continue;
    }

    addDeclaration(
      `declare type ${currentTypeName} = ` + typeInfo.formattedDefinition
    );
    addedDeclarationList[currentTypeName] = currentTypeName;
    typeInfo.associatedTypeNames.forEach((subType) => {
      if (
        !Object.prototype.hasOwnProperty.call(addedDeclarationList, subType)
      ) {
        typeNameQueue.push(subType);
      }
    });
  }
}

addRemainingDeclarations();
mModelMappings.forEach((modelMapping) => {
  addDeclaration(getDelegateDeclaration(modelMapping.model));
});
addDeclaration(mPrismaClientDeclaration);
addDeclaration(
  "\
    declare module.exports: {\n\
        PrismaClient(): PrismaClient,\n\
    }"
);

fs.writeFileSync(
  "./flow-typed/npm/@prisma/client_vx.x.x.js",
  mModuleDeclaration,
  "utf8"
);
