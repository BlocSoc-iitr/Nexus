import type { DeployContractsInput } from "./schemas.js";
import { account, walletClient } from '../../../client.js';
import { publicClient } from '../../../config.js';

export async function deployContracts(input: DeployContractsInput) {
    const { abi, bytecode, constructorArguments } = input;
    const hash = await walletClient.deployContract({
        abi: abi as any,
        bytecode: bytecode as `0x${string}`,
        args: constructorArguments,
        account: account,
    })

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return {
        content: [
            {
                type: "text",
                text: `Deployer: ${account.address}\nTransaction hash: ${hash}\nContract address: ${receipt.contractAddress}`,
            }
        ]
    }
}