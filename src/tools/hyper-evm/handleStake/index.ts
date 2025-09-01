import { walletClient, exchClient, infoClient } from "../../../config.js";
import type { getStakingInput, getUnstakingInput } from "./schemas.js";
import { parseEther } from "viem";

export async function performStaking(stakingDetails: getStakingInput) {
  console.error(
    "Starting performStaking function with details:",
    stakingDetails
  );

  try {
    console.error("Fetching validator summaries...");
    const validators = await infoClient.validatorSummaries();
    console.error("Found validators:", validators.length);

    const validator = validators.find(
      v => v.validator === stakingDetails.validatorAddress
    );

    if (!validator) {
      console.error(`Validator not found: ${stakingDetails.validatorAddress}`);
      throw new Error(`Validator ${stakingDetails.validatorAddress} not found`);
    }

    console.error("Found validator:", validator.name);

    console.error("Parsing amount to Wei...");
    const amountWei = parseEther(stakingDetails.amountToStake);
    console.error("Amount in Wei:", amountWei.toString());

    console.error("Initiating deposit...");
    const depositResult = await exchClient.cDeposit({
      wei: Number(amountWei),
    });
    console.error("Deposit result:", depositResult);

    if (depositResult.status !== "ok") {
      console.error("Deposit failed with status:", depositResult.status);
      throw new Error(`Deposit failed: ${JSON.stringify(depositResult)}`);
    }

    console.error("Deposit successful, waiting 3 seconds for processing...");
    // Wait for deposit to process
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.error("Initiating delegation...");
    const delegationResult = await exchClient.tokenDelegate({
      validator: stakingDetails.validatorAddress,
      wei: Number(stakingDetails.amountToStake),
      isUndelegate: false,
    });
    console.error("Delegation result:", delegationResult);

    if (delegationResult.status !== "ok") {
      console.error("Delegation failed with status:", delegationResult.status);
      throw new Error(`Delegation failed: ${JSON.stringify(delegationResult)}`);
    }

    console.error("Getting wallet client account...");
    const userAddress = walletClient.account?.address;
    if (!userAddress) {
      console.error(
        "Failed to load wallet client account - account is undefined"
      );
      throw new Error("Failed to load wallet client account");
    }
    console.error("User address:", userAddress);

    console.error("Fetching updated delegations...");
    const updatedDelegations = await infoClient.delegations({
      user: userAddress,
    });
    console.error("Updated delegations:", updatedDelegations);

    const newDelegation = updatedDelegations.find(
      d => d.validator === stakingDetails.validatorAddress
    );
    console.error("New delegation found:", newDelegation);

    console.error("Staking completed successfully");
    return {
      content: [
        {
          type: "text",
          text: `Staking successful!\nValidator: ${validator.name}\nAmount Staked: ${stakingDetails.amountToStake} HYPE\nTotal Delegated to Validator: ${newDelegation?.amount || "0"} HYPE\nDeposit TX: ${depositResult.response?.type}\nDelegation TX: ${delegationResult.response?.type}`,
        },
      ],
    };
  } catch (error) {
    console.error("Error performing staking:", error);
    console.error(
      "Error stack trace:",
      error instanceof Error ? error.stack : "No stack trace available"
    );
    console.error("Staking details that caused error:", stakingDetails);
    throw new Error(
      `Failed to perform staking: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function performUnstaking(unstakingDetails: getUnstakingInput) {
  try {
    const userAddress = walletClient.account?.address;
    if (!userAddress) {
      throw new Error("Failed to load wallet client account");
    }
    const currentDelegations = await infoClient.delegations({
      user: userAddress,
    });

    if (currentDelegations.length === 0) {
      throw new Error("No active delegations found to unstake from");
    }

    const totalDelegated = currentDelegations.reduce(
      (sum, delegation) => sum + parseFloat(delegation.amount),
      0
    );

    const requestedAmount = parseFloat(unstakingDetails.amountToUnstake);

    if (requestedAmount > totalDelegated) {
      throw new Error(
        `Insufficient staked amount. Available: ${totalDelegated}, Requested: ${requestedAmount}`
      );
    }

    let remainingToUnstake = requestedAmount;
    const undelegationResults = [];

    for (const delegation of currentDelegations) {
      if (remainingToUnstake <= 0) {
        break;
      }

      const delegatedAmount = parseFloat(delegation.amount);
      const amountToUndelegateFromThis = Math.min(
        remainingToUnstake,
        delegatedAmount
      );
      const newDelegationAmount = (
        delegatedAmount - amountToUndelegateFromThis
      ).toString();

      const undelegateResult = await exchClient.tokenDelegate({
        validator: delegation.validator,
        wei: Number(newDelegationAmount),
        isUndelegate: true,
      });

      if (undelegateResult.status !== "ok") {
        console.warn(
          `Failed to undelegate from ${delegation.validator}:`,
          undelegateResult
        );
      } else {
        undelegationResults.push({
          validator: delegation.validator,
          undelegatedAmount: amountToUndelegateFromThis,
          result: undelegateResult,
        });
        remainingToUnstake -= amountToUndelegateFromThis;
      }

      // Small delay between undelegations
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (remainingToUnstake > 0) {
      throw new Error(
        `Could not undelegate full amount. Remaining: ${remainingToUnstake}`
      );
    }

    // Wait for undelegations to process
    await new Promise(resolve => setTimeout(resolve, 5000));

    const amountWei = parseEther(unstakingDetails.amountToUnstake).toString();

    const withdrawResult = await exchClient.cWithdraw({
      wei: Number(amountWei),
    });

    if (withdrawResult.status !== "ok") {
      throw new Error(`Withdrawal failed: ${JSON.stringify(withdrawResult)}`);
    }

    const finalSummary = await infoClient.delegatorSummary({
      user: userAddress,
    });

    return {
      content: [
        {
          type: "text",
          text: `Unstaking successful!\nAmount Unstaked: ${unstakingDetails.amountToUnstake} HYPE\nValidators Affected: ${undelegationResults.length}\nWithdrawal Status: ${withdrawResult.response?.type}\nRemaining Staked: ${finalSummary.delegated || "0"} HYPE\nAvailable in Staking Account: ${finalSummary.totalPendingWithdrawal || "0"} HYPE`,
        },
      ],
    };
  } catch (error) {
    console.error("Error performing unstaking:", error);
    throw new Error(
      `Failed to perform unstaking: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
