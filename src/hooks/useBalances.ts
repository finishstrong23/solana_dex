"use client";

import { useState, useEffect, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKENS } from "@/data/tokens";

interface BalanceMap {
  [mint: string]: number;
}

const SOL_MINT = "So11111111111111111111111111111111111111112";

export function useBalances() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [balances, setBalances] = useState<BalanceMap>({});
  const [loading, setLoading] = useState(false);

  const fetchBalances = useCallback(async () => {
    if (!publicKey || !connected) {
      setBalances({});
      return;
    }

    setLoading(true);
    try {
      const newBalances: BalanceMap = {};

      // Fetch SOL balance
      const solBalance = await connection.getBalance(publicKey);
      newBalances[SOL_MINT] = solBalance / LAMPORTS_PER_SOL;

      // Fetch all SPL token accounts
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") }
      );

      for (const account of tokenAccounts.value) {
        const info = account.account.data.parsed.info;
        const mint = info.mint;
        const amount = info.tokenAmount.uiAmount;
        if (amount > 0) {
          newBalances[mint] = amount;
        }
      }

      setBalances(newBalances);
    } catch (err) {
      console.error("Failed to fetch balances:", err);
    } finally {
      setLoading(false);
    }
  }, [publicKey, connected, connection]);

  useEffect(() => {
    fetchBalances();
    // Refresh balances every 30 seconds
    const interval = setInterval(fetchBalances, 30_000);
    return () => clearInterval(interval);
  }, [fetchBalances]);

  const getBalance = useCallback(
    (mint: string): number => {
      return balances[mint] ?? 0;
    },
    [balances]
  );

  const getBalanceBySymbol = useCallback(
    (symbol: string): number => {
      const token = TOKENS.find((t) => t.symbol === symbol);
      if (!token) return 0;
      return balances[token.mint] ?? 0;
    },
    [balances]
  );

  return { balances, loading, getBalance, getBalanceBySymbol, refetch: fetchBalances };
}
