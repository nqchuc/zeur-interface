export const UIPoolDataABI = [
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
        "name": "implementation",
        "type": "address"
      }
    ],
    "name": "Upgraded",
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
      { "internalType": "address", "name": "asset", "type": "address" }
    ],
    "name": "getAssetData",
    "outputs": [
      {
        "components": [
          {
            "internalType": "enum IPool.AssetType",
            "name": "assetType",
            "type": "uint8"
          },
          { "internalType": "address", "name": "asset", "type": "address" },
          { "internalType": "address", "name": "colToken", "type": "address" },
          { "internalType": "address", "name": "debtToken", "type": "address" },
          {
            "internalType": "address",
            "name": "tokenVault",
            "type": "address"
          },
          { "internalType": "uint256", "name": "supplyCap", "type": "uint256" },
          { "internalType": "uint256", "name": "borrowCap", "type": "uint256" },
          {
            "internalType": "uint256",
            "name": "totalSupply",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalBorrow",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalShares",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "utilizationRate",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "supplyRate",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "borrowRate",
            "type": "uint256"
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
          { "internalType": "uint8", "name": "decimals", "type": "uint8" },
          { "internalType": "bool", "name": "isFrozen", "type": "bool" },
          { "internalType": "bool", "name": "isPaused", "type": "bool" },
          {
            "components": [
              {
                "internalType": "address",
                "name": "stakedToken",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "underlyingAmount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "stakedAmount",
                "type": "uint256"
              }
            ],
            "internalType": "struct IPoolData.StakedTokenData[]",
            "name": "stakedTokens",
            "type": "tuple[]"
          }
        ],
        "internalType": "struct IPoolData.AssetData",
        "name": "",
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
      {
        "internalType": "address[]",
        "name": "collateralAssets",
        "type": "address[]"
      }
    ],
    "name": "getCollateralAssetsConfiguration",
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
        "internalType": "struct IPool.CollateralConfiguration[]",
        "name": "",
        "type": "tuple[]"
      }
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
      { "internalType": "address[]", "name": "debtAssets", "type": "address[]" }
    ],
    "name": "getDebtAssetsConfiguration",
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
        "internalType": "struct IPool.DebtConfiguration[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "getUserData",
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
          },
          {
            "components": [
              {
                "internalType": "address",
                "name": "collateralAsset",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "supplyBalance",
                "type": "uint256"
              }
            ],
            "internalType": "struct IPoolData.UserCollateralData[]",
            "name": "userCollateralData",
            "type": "tuple[]"
          },
          {
            "components": [
              {
                "internalType": "address",
                "name": "debtAsset",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "supplyBalance",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "borrowBalance",
                "type": "uint256"
              }
            ],
            "internalType": "struct IPoolData.UserDebtData[]",
            "name": "userDebtData",
            "type": "tuple[]"
          }
        ],
        "internalType": "struct IPoolData.UserData",
        "name": "",
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
        "name": "initialAuthority",
        "type": "address"
      },
      { "internalType": "address", "name": "pool", "type": "address" },
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
    "inputs": [],
    "name": "proxiableUUID",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
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
        "name": "newImplementation",
        "type": "address"
      },
      { "internalType": "bytes", "name": "data", "type": "bytes" }
    ],
    "name": "upgradeToAndCall",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
] as const