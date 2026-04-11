/**
 * Blockchain Configuration - Monad Testnet RPC
 * Handles blockchain transaction verification
 */

const RPC_URL = process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz/';
const WALLET_ADDRESS = (process.env.WALLET_ADDRESS || '0x7894561230987456123098745612309874561230').toLowerCase();

/**
 * Verify blockchain transaction
 * @param {string} txHash - Transaction hash
 * @returns {object} { success: boolean, message: string }
 */
const verifyBlockchainTransaction = async (txHash) => {
    try {
        // Get transaction details
        const txResponse = await fetch(RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "eth_getTransactionByHash",
                params: [txHash],
                id: 1
            })
        });
        
        const txData = await txResponse.json();
        const tx = txData.result;

        if (!tx) {
            return { success: false, message: "Transaction not found" };
        }

        // Verify recipient address
        if (tx.to && tx.to.toLowerCase() !== WALLET_ADDRESS) {
            return { success: false, message: "Invalid recipient address" };
        }

        // Verify minimum amount (0.001 ETH = 1e15 wei)
        const valueWei = BigInt(tx.value);
        const minWei = BigInt("1000000000000000");
        if (valueWei < minWei) {
            return { success: false, message: "Insufficient transaction amount" };
        }

        // Check transaction receipt for confirmation
        const receiptResponse = await fetch(RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "eth_getTransactionReceipt",
                params: [txHash],
                id: 2
            })
        });

        const receiptData = await receiptResponse.json();
        const receipt = receiptData.result;

        if (!receipt) {
            return { success: false, message: "Transaction pending or not confirmed" };
        }

        if (receipt.status !== "0x1") {
            return { success: false, message: "Transaction execution failed" };
        }

        console.log(`[Blockchain] ✓ Transaction ${txHash.substring(0, 10)}... verified`);
        return { success: true };

    } catch (err) {
        console.error("[Blockchain] Verification error:", err.message);
        return { success: false, message: "Blockchain verification service error" };
    }
};

module.exports = {
    RPC_URL,
    WALLET_ADDRESS,
    verifyBlockchainTransaction
};
