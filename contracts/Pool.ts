import { Address } from "viem"

export const PoolABI = [
    { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
    {
      "inputs": [
        { "internalType": "address", "name": "authority", "type": "address" }
      ],
      "name": "AccessManagedInvalidAuthority",
      "type": "error"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "caller", "type": "address" },
        { "internalType": "uint32", "name": "delay", "type": "uint32" }
      ],
      "name": "AccessManagedRequiredDelay",
      "type": "error"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "caller", "type": "address" }
      ],
      "name": "AccessManagedUnauthorized",
      "type": "error"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "target", "type": "address" }
      ],
      "name": "AddressEmptyCode",
      "type": "error"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "implementation", "type": "address" }
      ],
      "name": "ERC1967InvalidImplementation",
      "type": "error"
    },
    { "inputs": [], "name": "ERC1967NonPayable", "type": "error" },
    { "inputs": [], "name": "FailedCall", "type": "error" },
    { "inputs": [], "name": "InvalidInitialization", "type": "error" },
    { "inputs": [], "name": "NotInitializing", "type": "error" },
    {
      "inputs": [
        { "internalType": "address", "name": "asset", "type": "address" }
      ],
      "name": "Pool_AssetAlreadyInitialized",
      "type": "error"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "asset", "type": "address" }
      ],
      "name": "Pool_AssetNotAllowed",
      "type": "error"
    },
    { "inputs": [], "name": "Pool_BorrowCapExceeded", "type": "error" },
    { "inputs": [], "name": "Pool_CollateralFrozen", "type": "error" },
    { "inputs": [], "name": "Pool_CollateralPaused", "type": "error" },
    { "inputs": [], "name": "Pool_DebtFrozen", "type": "error" },
    { "inputs": [], "name": "Pool_DebtPaused", "type": "error" },
    {
      "inputs": [],
      "name": "Pool_InsufficientAvailableBorrowsValue",
      "type": "error"
    },
    { "inputs": [], "name": "Pool_InsufficientHealthFactor", "type": "error" },
    { "inputs": [], "name": "Pool_InvalidAmount", "type": "error" },
    { "inputs": [], "name": "Pool_SupplyCapExceeded", "type": "error" },
    { "inputs": [], "name": "ReentrancyGuardReentrantCall", "type": "error" },
    {
      "inputs": [
        { "internalType": "address", "name": "token", "type": "address" }
      ],
      "name": "SafeERC20FailedOperation",
      "type": "error"
    },
    { "inputs": [], "name": "UUPSUnauthorizedCallContext", "type": "error" },
    {
      "inputs": [
        { "internalType": "bytes32", "name": "slot", "type": "bytes32" }
      ],
      "name": "UUPSUnsupportedProxiableUUID",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "authority",
          "type": "address"
        }
      ],
      "name": "AuthorityUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "asset",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "caller",
          "type": "address"
        }
      ],
      "name": "Borrow",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "collateralAsset",
          "type": "address"
        },
        {
          "components": [
            { "internalType": "uint256", "name": "supplyCap", "type": "uint256" },
            { "internalType": "uint256", "name": "borrowCap", "type": "uint256" },
            { "internalType": "address", "name": "colToken", "type": "address" },
            {
              "internalType": "address",
              "name": "tokenVault",
              "type": "address"
            },
            { "internalType": "uint16", "name": "ltv", "type": "uint16" },
            {
              "internalType": "uint16",
              "name": "liquidationThreshold",
              "type": "uint16"
            },
            {
              "internalType": "uint16",
              "name": "liquidationBonus",
              "type": "uint16"
            },
            {
              "internalType": "uint16",
              "name": "liquidationProtocolFee",
              "type": "uint16"
            },
            {
              "internalType": "uint16",
              "name": "reserveFactor",
              "type": "uint16"
            },
            { "internalType": "bool", "name": "isFrozen", "type": "bool" },
            { "internalType": "bool", "name": "isPaused", "type": "bool" }
          ],
          "indexed": false,
          "internalType": "struct IPool.CollateralConfiguration",
          "name": "collateralConfiguration",
          "type": "tuple"
        }
      ],
      "name": "InitCollateralAsset",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "debtAsset",
          "type": "address"
        },
        {
          "components": [
            { "internalType": "uint256", "name": "supplyCap", "type": "uint256" },
            { "internalType": "uint256", "name": "borrowCap", "type": "uint256" },
            { "internalType": "address", "name": "colToken", "type": "address" },
            { "internalType": "address", "name": "debtToken", "type": "address" },
            {
              "internalType": "uint16",
              "name": "reserveFactor",
              "type": "uint16"
            },
            { "internalType": "bool", "name": "isFrozen", "type": "bool" },
            { "internalType": "bool", "name": "isPaused", "type": "bool" }
          ],
          "indexed": false,
          "internalType": "struct IPool.DebtConfiguration",
          "name": "debtConfiguration",
          "type": "tuple"
        }
      ],
      "name": "InitDebtAsset",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "version",
          "type": "uint64"
        }
      ],
      "name": "Initialized",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "collateralAsset",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "debtAsset",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "debtAmount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "liquidator",
          "type": "address"
        }
      ],
      "name": "Liquidate",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "asset",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "caller",
          "type": "address"
        }
      ],
      "name": "Repay",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "oracleManager",
          "type": "address"
        }
      ],
      "name": "SetChainlinkOracleManager",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "collateralAsset",
          "type": "address"
        },
        {
          "components": [
            { "internalType": "uint256", "name": "supplyCap", "type": "uint256" },
            { "internalType": "uint256", "name": "borrowCap", "type": "uint256" },
            { "internalType": "address", "name": "colToken", "type": "address" },
            {
              "internalType": "address",
              "name": "tokenVault",
              "type": "address"
            },
            { "internalType": "uint16", "name": "ltv", "type": "uint16" },
            {
              "internalType": "uint16",
              "name": "liquidationThreshold",
              "type": "uint16"
            },
            {
              "internalType": "uint16",
              "name": "liquidationBonus",
              "type": "uint16"
            },
            {
              "internalType": "uint16",
              "name": "liquidationProtocolFee",
              "type": "uint16"
            },
            {
              "internalType": "uint16",
              "name": "reserveFactor",
              "type": "uint16"
            },
            { "internalType": "bool", "name": "isFrozen", "type": "bool" },
            { "internalType": "bool", "name": "isPaused", "type": "bool" }
          ],
          "indexed": false,
          "internalType": "struct IPool.CollateralConfiguration",
          "name": "collateralConfiguration",
          "type": "tuple"
        }
      ],
      "name": "SetCollateralConfiguration",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "debtAsset",
          "type": "address"
        },
        {
          "components": [
            { "internalType": "uint256", "name": "supplyCap", "type": "uint256" },
            { "internalType": "uint256", "name": "borrowCap", "type": "uint256" },
            { "internalType": "address", "name": "colToken", "type": "address" },
            { "internalType": "address", "name": "debtToken", "type": "address" },
            {
              "internalType": "uint16",
              "name": "reserveFactor",
              "type": "uint16"
            },
            { "internalType": "bool", "name": "isFrozen", "type": "bool" },
            { "internalType": "bool", "name": "isPaused", "type": "bool" }
          ],
          "indexed": false,
          "internalType": "struct IPool.DebtConfiguration",
          "name": "debtConfiguration",
          "type": "tuple"
        }
      ],
      "name": "SetDebtConfiguration",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "asset",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "caller",
          "type": "address"
        }
      ],
      "name": "Supply",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "implementation",
          "type": "address"
        }
      ],
      "name": "Upgraded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "asset",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "caller",
          "type": "address"
        }
      ],
      "name": "Withdraw",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "UPGRADE_INTERFACE_VERSION",
      "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "authority",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "asset", "type": "address" },
        { "internalType": "uint256", "name": "amount", "type": "uint256" },
        { "internalType": "address", "name": "to", "type": "address" }
      ],
      "name": "borrow",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "collateralAsset",
          "type": "address"
        }
      ],
      "name": "getCollateralAssetConfiguration",
      "outputs": [
        {
          "components": [
            { "internalType": "uint256", "name": "supplyCap", "type": "uint256" },
            { "internalType": "uint256", "name": "borrowCap", "type": "uint256" },
            { "internalType": "address", "name": "colToken", "type": "address" },
            {
              "internalType": "address",
              "name": "tokenVault",
              "type": "address"
            },
            { "internalType": "uint16", "name": "ltv", "type": "uint16" },
            {
              "internalType": "uint16",
              "name": "liquidationThreshold",
              "type": "uint16"
            },
            {
              "internalType": "uint16",
              "name": "liquidationBonus",
              "type": "uint16"
            },
            {
              "internalType": "uint16",
              "name": "liquidationProtocolFee",
              "type": "uint16"
            },
            {
              "internalType": "uint16",
              "name": "reserveFactor",
              "type": "uint16"
            },
            { "internalType": "bool", "name": "isFrozen", "type": "bool" },
            { "internalType": "bool", "name": "isPaused", "type": "bool" }
          ],
          "internalType": "struct IPool.CollateralConfiguration",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getCollateralAssetList",
      "outputs": [
        { "internalType": "address[]", "name": "", "type": "address[]" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "debtAsset", "type": "address" }
      ],
      "name": "getDebtAssetConfiguration",
      "outputs": [
        {
          "components": [
            { "internalType": "uint256", "name": "supplyCap", "type": "uint256" },
            { "internalType": "uint256", "name": "borrowCap", "type": "uint256" },
            { "internalType": "address", "name": "colToken", "type": "address" },
            { "internalType": "address", "name": "debtToken", "type": "address" },
            {
              "internalType": "uint16",
              "name": "reserveFactor",
              "type": "uint16"
            },
            { "internalType": "bool", "name": "isFrozen", "type": "bool" },
            { "internalType": "bool", "name": "isPaused", "type": "bool" }
          ],
          "internalType": "struct IPool.DebtConfiguration",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getDebtAssetList",
      "outputs": [
        { "internalType": "address[]", "name": "", "type": "address[]" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "user", "type": "address" }
      ],
      "name": "getUserAccountData",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "totalCollateralValue",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "totalDebtValue",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "availableBorrowsValue",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "currentLiquidationThreshold",
              "type": "uint256"
            },
            { "internalType": "uint256", "name": "ltv", "type": "uint256" },
            {
              "internalType": "uint256",
              "name": "healthFactor",
              "type": "uint256"
            }
          ],
          "internalType": "struct IPool.UserAccountData",
          "name": "userAccountData",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "collateralAsset",
          "type": "address"
        },
        {
          "components": [
            { "internalType": "uint256", "name": "supplyCap", "type": "uint256" },
            { "internalType": "uint256", "name": "borrowCap", "type": "uint256" },
            { "internalType": "address", "name": "colToken", "type": "address" },
            {
              "internalType": "address",
              "name": "tokenVault",
              "type": "address"
            },
            { "internalType": "uint16", "name": "ltv", "type": "uint16" },
            {
              "internalType": "uint16",
              "name": "liquidationThreshold",
              "type": "uint16"
            },
            {
              "internalType": "uint16",
              "name": "liquidationBonus",
              "type": "uint16"
            },
            {
              "internalType": "uint16",
              "name": "liquidationProtocolFee",
              "type": "uint16"
            },
            {
              "internalType": "uint16",
              "name": "reserveFactor",
              "type": "uint16"
            },
            { "internalType": "bool", "name": "isFrozen", "type": "bool" },
            { "internalType": "bool", "name": "isPaused", "type": "bool" }
          ],
          "internalType": "struct IPool.CollateralConfiguration",
          "name": "collateralConfiguration",
          "type": "tuple"
        }
      ],
      "name": "initCollateralAsset",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "debtAsset", "type": "address" },
        {
          "components": [
            { "internalType": "uint256", "name": "supplyCap", "type": "uint256" },
            { "internalType": "uint256", "name": "borrowCap", "type": "uint256" },
            { "internalType": "address", "name": "colToken", "type": "address" },
            { "internalType": "address", "name": "debtToken", "type": "address" },
            {
              "internalType": "uint16",
              "name": "reserveFactor",
              "type": "uint16"
            },
            { "internalType": "bool", "name": "isFrozen", "type": "bool" },
            { "internalType": "bool", "name": "isPaused", "type": "bool" }
          ],
          "internalType": "struct IPool.DebtConfiguration",
          "name": "debtConfiguration",
          "type": "tuple"
        }
      ],
      "name": "initDebtAsset",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "initialAuthority",
          "type": "address"
        },
        { "internalType": "address", "name": "oracleManager", "type": "address" }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "isConsumingScheduledOp",
      "outputs": [{ "internalType": "bytes4", "name": "", "type": "bytes4" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "collateralAsset",
          "type": "address"
        },
        { "internalType": "address", "name": "debtAsset", "type": "address" },
        { "internalType": "uint256", "name": "debtAmount", "type": "uint256" },
        { "internalType": "address", "name": "from", "type": "address" }
      ],
      "name": "liquidate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "proxiableUUID",
      "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "asset", "type": "address" },
        { "internalType": "uint256", "name": "amount", "type": "uint256" },
        { "internalType": "address", "name": "from", "type": "address" }
      ],
      "name": "repay",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "newAuthority", "type": "address" }
      ],
      "name": "setAuthority",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "collateralAsset",
          "type": "address"
        },
        {
          "components": [
            { "internalType": "uint256", "name": "supplyCap", "type": "uint256" },
            { "internalType": "uint256", "name": "borrowCap", "type": "uint256" },
            { "internalType": "address", "name": "colToken", "type": "address" },
            {
              "internalType": "address",
              "name": "tokenVault",
              "type": "address"
            },
            { "internalType": "uint16", "name": "ltv", "type": "uint16" },
            {
              "internalType": "uint16",
              "name": "liquidationThreshold",
              "type": "uint16"
            },
            {
              "internalType": "uint16",
              "name": "liquidationBonus",
              "type": "uint16"
            },
            {
              "internalType": "uint16",
              "name": "liquidationProtocolFee",
              "type": "uint16"
            },
            {
              "internalType": "uint16",
              "name": "reserveFactor",
              "type": "uint16"
            },
            { "internalType": "bool", "name": "isFrozen", "type": "bool" },
            { "internalType": "bool", "name": "isPaused", "type": "bool" }
          ],
          "internalType": "struct IPool.CollateralConfiguration",
          "name": "collateralConfiguration",
          "type": "tuple"
        }
      ],
      "name": "setCollateralConfiguration",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "debtAsset", "type": "address" },
        {
          "components": [
            { "internalType": "uint256", "name": "supplyCap", "type": "uint256" },
            { "internalType": "uint256", "name": "borrowCap", "type": "uint256" },
            { "internalType": "address", "name": "colToken", "type": "address" },
            { "internalType": "address", "name": "debtToken", "type": "address" },
            {
              "internalType": "uint16",
              "name": "reserveFactor",
              "type": "uint16"
            },
            { "internalType": "bool", "name": "isFrozen", "type": "bool" },
            { "internalType": "bool", "name": "isPaused", "type": "bool" }
          ],
          "internalType": "struct IPool.DebtConfiguration",
          "name": "debtConfiguration",
          "type": "tuple"
        }
      ],
      "name": "setDebtConfiguration",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "asset", "type": "address" },
        { "internalType": "uint256", "name": "amount", "type": "uint256" },
        { "internalType": "address", "name": "from", "type": "address" }
      ],
      "name": "supply",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newImplementation",
          "type": "address"
        },
        { "internalType": "bytes", "name": "data", "type": "bytes" }
      ],
      "name": "upgradeToAndCall",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "asset", "type": "address" },
        { "internalType": "uint256", "name": "amount", "type": "uint256" },
        { "internalType": "address", "name": "to", "type": "address" }
      ],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
  
export const POOL_ADDRESS = process.env.NEXT_PUBLIC_POOL_ADDRESS as Address || '0x0000000000000000000000000000000000000000'
