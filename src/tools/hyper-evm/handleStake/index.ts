import { walletClient, exchClient, infoClient } from "../../../config.js";
import type { getStakingInput, getUnstakingInput } from "./schemas.js";

export async function performStaking(stakingDetails: getStakingInput) {
  try {
    const validators = await infoClient.validatorSummaries();

    const validator = validators.find(
      v => v.validator === stakingDetails.validatorAddress
    );

    if (!validator) {
      throw new Error(`Validator ${stakingDetails.validatorAddress} not found`);
    }

    const amountScaled = Number(
      (parseFloat(stakingDetails.amountToStake) * 1e8).toFixed(0)
    );

    const depositResult = await exchClient.cDeposit({
      wei: amountScaled,
    });

    if (depositResult.status !== "ok") {
      throw new Error(`Deposit failed: ${JSON.stringify(depositResult)}`);
    }

    // Wait for deposit to process
    await new Promise(resolve => setTimeout(resolve, 3000));

    const delegationResult = await exchClient.tokenDelegate({
      validator: stakingDetails.validatorAddress,
      wei: amountScaled,
      isUndelegate: false,
    });

    if (delegationResult.status !== "ok") {
      throw new Error(`Delegation failed: ${JSON.stringify(delegationResult)}`);
    }

    const userAddress = walletClient.account?.address;
    if (!userAddress) {
      throw new Error("Failed to load wallet client account");
    }

    const updatedDelegations = await infoClient.delegations({
      user: userAddress,
    });

    const newDelegation = updatedDelegations.find(
      d => d.validator === stakingDetails.validatorAddress
    );

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
      (sum, delegation) =>
        sum + Number(parseFloat(delegation.amount).toFixed(8)),
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
      const newUndelegatedAmountScaled = Number(
        (amountToUndelegateFromThis * 1e8).toFixed(0)
      );

      const undelegateResult = await exchClient.tokenDelegate({
        validator: delegation.validator,
        wei: newUndelegatedAmountScaled,
        isUndelegate: true,
      });

      if (undelegateResult.status !== "ok") {
        throw new Error(`Failed to undelegate from ${delegation.validator}:`);
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

    const amountScaledWithdraw = Number(
      (parseFloat(unstakingDetails.amountToUnstake) * 1e8).toFixed(0)
    );

    const withdrawResult = await exchClient.cWithdraw({
      wei: amountScaledWithdraw,
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
