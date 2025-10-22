import { type Abi, type AbiFunction, isAddress } from "viem";
import { publicClient, walletClient } from "../../../config.js";
import type { GetContractDetails } from "./schema.js";

export async function callContracts(contractDetails: GetContractDetails) {
  try {
    const address = contractDetails.contractAddress;
    if (!isAddress(address)) {
      throw new Error(`Invalid HyperEVM address: ${address}`);
    }

    let abi: Abi;
    if (typeof contractDetails.abi === "string") {
      try {
        abi = JSON.parse(contractDetails.abi) as Abi;
      } catch (error) {
        throw new Error(`Invalid ABI string: ${error}`);
      }
    } else {
      abi = contractDetails.abi as Abi;
    }

    const functionAbi = abi.find(
      (item): item is AbiFunction =>
        "type" in item &&
        item.type === "function" &&
        "name" in item &&
        item.name === contractDetails.functionName
    );

    if (!functionAbi) {
      throw new Error(
        `Function ${contractDetails.functionName} not found in ABI`
      );
    }

    if (
      functionAbi.stateMutability === "view" ||
      functionAbi.stateMutability === "pure"
    ) {
      const callParams: any = {
        address: contractDetails.contractAddress,
        abi,
        functionName: contractDetails.functionName,
      };

      if (functionAbi.inputs && functionAbi.inputs.length > 0) {
        if (
          !contractDetails.functionArgs ||
          contractDetails.functionArgs.length !== functionAbi.inputs.length
        ) {
          throw Error(
            `Function ${contractDetails.functionName} expects ${functionAbi.inputs.length} arguments, ` +
              `${contractDetails.functionArgs?.length || 0} provided`
          );
        }
        callParams.args = contractDetails.functionArgs;
      }

      return await publicClient.readContract(callParams);
    }

    const callParams: any = {
      address: contractDetails.contractAddress,
      abi,
      functionName: contractDetails.functionName,
    };

    if (functionAbi.inputs && functionAbi.inputs.length > 0) {
      if (
        !contractDetails.functionArgs ||
        contractDetails.functionArgs.length !== functionAbi.inputs.length
      ) {
        throw Error(
          `Function ${contractDetails.functionName} expects ${functionAbi.inputs.length} arguments, ` +
            `${contractDetails.functionArgs?.length || 0} provided`
        );
      }
      callParams.args = contractDetails.functionArgs;
    }

    return await walletClient.writeContract(callParams);
  } catch (error) {
    console.log(error);
    throw Error(
      `Failed to call contract function: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
