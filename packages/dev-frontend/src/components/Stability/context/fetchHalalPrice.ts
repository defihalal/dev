import { Decimal } from "@liquity/lib-base";

type UniswapResponse = {
  data?: {
    bundle: {
      ethPrice: string;
    } | null;
    token: {
      derivedETH: string;
    } | null;
  };
  errors?: Array<{ message: string }>;
};

const uniswapQuery = (halalTokenAddress: string) => `{
  token(id: "${halalTokenAddress.toLowerCase()}") {
    derivedETH
  },
  bundle(id: 1) {
    ethPrice
  },
}`;

export async function fetchHalalPrice(halalTokenAddress: string) {
  // const response = await window.fetch("https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2", {
  const response = await window.fetch(
    "https://api.thegraph.com/subgraphs/name/chrisjess/quickswap-matic-exchange",
    {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        query: uniswapQuery(halalTokenAddress),
        variables: null
      })
    }
  );
  console.log("UniswapResponse", await response.json());

  if (!response.ok) {
    return Promise.reject("Network error connecting to Quickswap subgraph");
  }

  const { data, errors }: UniswapResponse = await response.json();

  if (errors) {
    return Promise.reject(errors);
  }

  if (typeof data?.token?.derivedETH === "string" && typeof data?.bundle?.ethPrice === "string") {
    const ethPriceUSD = Decimal.from(data.bundle.ethPrice);
    const halalPriceUSD = Decimal.from(data.token.derivedETH).mul(ethPriceUSD);

    return { halalPriceUSD };
  }

  return Promise.reject("Quickswap doesn't have the required data to calculate yield");
}
