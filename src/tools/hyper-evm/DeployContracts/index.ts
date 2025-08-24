import type { DeployContractsInput } from "./schemas.js";
import { account, walletClient } from "../../../client.js";
import { publicClient } from "../../../config.js";

export async function deployContracts(input: DeployContractsInput) {
  let { abi, bytecode, constructorArguments } = input;
  if (!bytecode.startsWith("0x")) bytecode = "0x" + bytecode;

  const hash = await walletClient.deployContract({
    abi: abi as any,
    bytecode: bytecode as `0x${string}`,
    args: constructorArguments,
    account: account,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  return {
    content: [
      {
        type: "text",
        text: `Contract deployed successfully!
Deployer: ${account.address}
Transaction hash: ${hash}
Contract address: ${receipt.contractAddress}`,
      },
    ],
  };
}
