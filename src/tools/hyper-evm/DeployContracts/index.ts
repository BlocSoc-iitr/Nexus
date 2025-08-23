import type { DeployContractsInput } from "./schemas.js";
import { account, walletClient } from '../../../client.js';
import { publicClient } from '../../../config.js';

export async function deployContracts(input: DeployContractsInput) {
    let { abi, bytecode, constructorArguments } = input;

    const cleanedAbi = JSON.stringify(abi)
        .replace(/\\"/g, '"')  // Replace \" with "
        .replace(/\\n/g, '\n') // Replace \\n with newline
        .replace(/\\t/g, '\t') // Replace \\t with tab
        .replace(/\\s/g, ' '); // Replace \\s with space

    const hash = await walletClient.deployContract({
        abi: cleanedAbi as any,
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