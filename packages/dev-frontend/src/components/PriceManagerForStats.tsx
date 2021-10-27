import React, { useState, useEffect } from "react";
import { Flex, Card } from "theme-ui";
import { InfoIcon } from "./InfoIcon";

import CoinGecko from "coingecko-api";

import { LiquityStoreState } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";
import { useLiquity } from "../hooks/LiquityContext";

const selectPrice = ({ price }: LiquityStoreState) => price;

export const PriceManagerForStats: React.FC = () => {
  const price = useLiquitySelector(selectPrice);
  const [editedPrice, setEditedPrice] = useState(price.toString(2));
  const [marketPrice, setMarketPrice] = useState();

  const { liquity } = useLiquity();

  const halalTokenAddress = liquity.connection.addresses.halalToken;
  const usdhTokenAddress = liquity.connection.addresses.usdhToken;

  const polygonscanUrlHalal =
    liquity.connection.chainId === 137
      ? `https://polygonscan.com/token/${halalTokenAddress}`
      : liquity.connection.chainId === 80001
      ? `https://mumbai.polygonscan.com/token/${halalTokenAddress}`
      : "";

  const polygonscanUrlUSDH =
    liquity.connection.chainId === 137
      ? `https://polygonscan.com/token/${usdhTokenAddress}`
      : liquity.connection.chainId === 80001
      ? `https://mumbai.polygonscan.com/token/${usdhTokenAddress}`
      : "";

  useEffect(() => {
    setEditedPrice(price.toString(2));
  }, [price]);

  useEffect(() => {
    const CoinGeckoClient = new CoinGecko();
    var getMarketPrices = async () => {
      let data = await CoinGeckoClient.simple.price({
        ids: ["matic-network"],
        vs_currencies: ["usd"]
      });
      setMarketPrice(data.data["matic-network"].usd);
    };
    getMarketPrices();
    const id = setInterval(() => {
      getMarketPrices();
    }, 15000);
    return () => {
      clearInterval(id);
    };
  }, []);

  return (
    <>
      <br />
      <Flex sx={{ flexDirection: "row" }}>
        <Flex sx={{ justifyContent: "flex-start", flex: 1 }}>
          <div
            className="css-1hrc83f"
            style={{
              flex: 1,
              flexDirection: "column",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <img src="./polygon.svg" alt="Polygon MATIC symbol" className="css-1ategy6" />

            <div>
              <strong>MATIC</strong>
            </div>
            <div>${editedPrice}</div>
            <div>
              <small>Oracle Price</small>
              <InfoIcon
                size="xs"
                tooltip={
                  <Card variant="tooltip">
                    The DeFi Halal Protocol uses the{" "}
                    <a
                      href="https://data.chain.link/polygon/mainnet/crypto-usd/matic-usd"
                      target="_blank"
                      rel="noreferrer"
                      title="Chainlink MATIC/USD Price Feed"
                      className="css-1nbd2zh"
                    >
                      Chainlink MATIC/USD price feed
                    </a>{" "}
                    as an Oracle for the price of MATIC. This price feed determines System and Trove
                    Collateral Ratios, and when liquidations can happen.
                  </Card>
                }
              />
            </div>
            <div>
              <a
                href="https://data.chain.link/polygon/mainnet/crypto-usd/matic-usd"
                target="_blank"
                rel="noreferrer"
                title="Chainlink MATIC/USD Price Feed"
                className="css-1nbd2zh"
              >
                <svg
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fas"
                  data-icon="satellite-dish"
                  className="svg-inline--fa fa-satellite-dish fa-w-16 "
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <path
                    fill="currentColor"
                    d="M305.44954,462.59c7.39157,7.29792,6.18829,20.09661-3.00038,25.00356-77.713,41.80281-176.72559,29.9105-242.34331-35.7082C-5.49624,386.28227-17.404,287.362,24.41381,209.554c4.89125-9.095,17.68975-10.29834,25.00318-3.00043L166.22872,323.36708l27.39411-27.39452c-.68759-2.60974-1.594-5.00071-1.594-7.81361a32.00407,32.00407,0,1,1,32.00407,32.00455c-2.79723,0-5.20378-.89075-7.79786-1.594l-27.40974,27.41015ZM511.9758,303.06732a16.10336,16.10336,0,0,1-16.002,17.00242H463.86031a15.96956,15.96956,0,0,1-15.89265-15.00213C440.46671,175.5492,336.45348,70.53427,207.03078,63.53328a15.84486,15.84486,0,0,1-15.00191-15.90852V16.02652A16.09389,16.09389,0,0,1,209.031.02425C372.25491,8.61922,503.47472,139.841,511.9758,303.06732Zm-96.01221-.29692a16.21093,16.21093,0,0,1-16.11142,17.29934H367.645a16.06862,16.06862,0,0,1-15.89265-14.70522c-6.90712-77.01094-68.118-138.91037-144.92467-145.22376a15.94,15.94,0,0,1-14.79876-15.89289V112.13393a16.134,16.134,0,0,1,17.29908-16.096C319.45132,104.5391,407.55627,192.64538,415.96359,302.7704Z"
                  ></path>
                </svg>
              </a>
            </div>
          </div>
        </Flex>
        <Flex sx={{ justifyContent: "flex-start", flex: 1 }}>
          <div
            className="css-1hrc83f"
            style={{
              flex: 1,
              flexDirection: "column",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <img src="./polygon.svg" alt="Polygon MATIC symbol" className="css-1ategy6" />
            <div>
              <strong>MATIC</strong>
            </div>
            <div>${marketPrice}</div>
            <div>
              <small>Market Price</small>
            </div>
            <div>
              <a
                href="https://www.coingecko.com/en/coins/polygon"
                target="_blank"
                rel="noreferrer"
                title="CoinGecko Information"
                className="css-1nbd2zh"
              >
                <svg
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fas"
                  data-icon="info-circle"
                  className="svg-inline--fa fa-info-circle fa-w-16 "
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <path
                    fill="currentColor"
                    d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 110c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z"
                  ></path>
                </svg>
              </a>
            </div>
          </div>
        </Flex>

        <Flex sx={{ justifyContent: "flex-start", flex: 1 }}>
          <div
            className="css-1hrc83f"
            style={{
              flex: 1,
              flexDirection: "column",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <img src="./usdh-icon.png" alt="USDH Symbol" className="css-1ategy6" />
            <div>
              <strong>USDH</strong>
            </div>
            {/* <div>$1.0</div>
            <div>
              <small>Market Price</small>
            </div> */}
            <div>
              <a
                href="https://www.coingecko.com/en/coins/"
                target="_blank"
                rel="noreferrer"
                title="CoinGecko Information"
              >
                <svg
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fas"
                  data-icon="info-circle"
                  className="svg-inline--fa fa-info-circle fa-w-16 "
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <path
                    fill="currentColor"
                    d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 110c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z"
                  ></path>
                </svg>
              </a>
              &nbsp;&nbsp;
              <a href={polygonscanUrlUSDH} target="_blank" rel="noreferrer" title="Contract Address">
                <svg
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fas"
                  data-icon="file-contract"
                  className="svg-inline--fa fa-file-contract fa-w-12 "
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 384 512"
                >
                  <path
                    fill="currentColor"
                    d="M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zM64 72c0-4.42 3.58-8 8-8h80c4.42 0 8 3.58 8 8v16c0 4.42-3.58 8-8 8H72c-4.42 0-8-3.58-8-8V72zm0 64c0-4.42 3.58-8 8-8h80c4.42 0 8 3.58 8 8v16c0 4.42-3.58 8-8 8H72c-4.42 0-8-3.58-8-8v-16zm192.81 248H304c8.84 0 16 7.16 16 16s-7.16 16-16 16h-47.19c-16.45 0-31.27-9.14-38.64-23.86-2.95-5.92-8.09-6.52-10.17-6.52s-7.22.59-10.02 6.19l-7.67 15.34a15.986 15.986 0 0 1-14.31 8.84c-.38 0-.75-.02-1.14-.05-6.45-.45-12-4.75-14.03-10.89L144 354.59l-10.61 31.88c-5.89 17.66-22.38 29.53-41 29.53H80c-8.84 0-16-7.16-16-16s7.16-16 16-16h12.39c4.83 0 9.11-3.08 10.64-7.66l18.19-54.64c3.3-9.81 12.44-16.41 22.78-16.41s19.48 6.59 22.77 16.41l13.88 41.64c19.77-16.19 54.05-9.7 66 14.16 2.02 4.06 5.96 6.5 10.16 6.5zM377 105L279.1 7c-4.5-4.5-10.6-7-17-7H256v128h128v-6.1c0-6.3-2.5-12.4-7-16.9z"
                  ></path>
                </svg>
              </a>
              &nbsp;&nbsp;
              <a
                href={`https://quickswap.exchange/#/swap?inputCurrency=${usdhTokenAddress}`}
                target="_blank"
                rel="noreferrer"
                title="Swap on Quickswap"
              >
                <svg
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fas"
                  data-icon="exchange-alt"
                  className="svg-inline--fa fa-exchange-alt fa-w-16 "
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <path
                    fill="currentColor"
                    d="M0 168v-16c0-13.255 10.745-24 24-24h360V80c0-21.367 25.899-32.042 40.971-16.971l80 80c9.372 9.373 9.372 24.569 0 33.941l-80 80C409.956 271.982 384 261.456 384 240v-48H24c-13.255 0-24-10.745-24-24zm488 152H128v-48c0-21.314-25.862-32.08-40.971-16.971l-80 80c-9.372 9.373-9.372 24.569 0 33.941l80 80C102.057 463.997 128 453.437 128 432v-48h360c13.255 0 24-10.745 24-24v-16c0-13.255-10.745-24-24-24z"
                  ></path>
                </svg>
              </a>
            </div>
          </div>
        </Flex>
        <Flex sx={{ justifyContent: "flex-start", flex: 1 }}>
          <div
            className="css-1hrc83f"
            style={{
              flex: 1,
              flexDirection: "column",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <img src="./halal-icon.png" alt="HALAL symbol" className="css-1ategy6" />
            <div>
              <strong>HALAL</strong>
            </div>
            {/* <div>$0</div>
            <div>
              <small>Market Price</small>
            </div> */}
            <div>
              <a
                href="https://www.coingecko.com/en/coins/"
                target="_blank"
                rel="noreferrer"
                title="CoinGecko Information"
              >
                <svg
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fas"
                  data-icon="info-circle"
                  className="svg-inline--fa fa-info-circle fa-w-16 "
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <path
                    fill="currentColor"
                    d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 110c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z"
                  ></path>
                </svg>
              </a>
              &nbsp;&nbsp;
              <a
                href={polygonscanUrlHalal}
                target="_blank"
                rel="noreferrer"
                title="Contract Address"
              >
                <svg
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fas"
                  data-icon="file-contract"
                  className="svg-inline--fa fa-file-contract fa-w-12 "
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 384 512"
                >
                  <path
                    fill="currentColor"
                    d="M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zM64 72c0-4.42 3.58-8 8-8h80c4.42 0 8 3.58 8 8v16c0 4.42-3.58 8-8 8H72c-4.42 0-8-3.58-8-8V72zm0 64c0-4.42 3.58-8 8-8h80c4.42 0 8 3.58 8 8v16c0 4.42-3.58 8-8 8H72c-4.42 0-8-3.58-8-8v-16zm192.81 248H304c8.84 0 16 7.16 16 16s-7.16 16-16 16h-47.19c-16.45 0-31.27-9.14-38.64-23.86-2.95-5.92-8.09-6.52-10.17-6.52s-7.22.59-10.02 6.19l-7.67 15.34a15.986 15.986 0 0 1-14.31 8.84c-.38 0-.75-.02-1.14-.05-6.45-.45-12-4.75-14.03-10.89L144 354.59l-10.61 31.88c-5.89 17.66-22.38 29.53-41 29.53H80c-8.84 0-16-7.16-16-16s7.16-16 16-16h12.39c4.83 0 9.11-3.08 10.64-7.66l18.19-54.64c3.3-9.81 12.44-16.41 22.78-16.41s19.48 6.59 22.77 16.41l13.88 41.64c19.77-16.19 54.05-9.7 66 14.16 2.02 4.06 5.96 6.5 10.16 6.5zM377 105L279.1 7c-4.5-4.5-10.6-7-17-7H256v128h128v-6.1c0-6.3-2.5-12.4-7-16.9z"
                  ></path>
                </svg>
              </a>
              &nbsp;&nbsp;
              <a
                href={`https://quickswap.exchange/#/swap?inputCurrency=${halalTokenAddress}`}
                target="_blank"
                rel="noreferrer"
                title="Swap on Quickswap"
              >
                <svg
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fas"
                  data-icon="exchange-alt"
                  className="svg-inline--fa fa-exchange-alt fa-w-16 "
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <path
                    fill="currentColor"
                    d="M0 168v-16c0-13.255 10.745-24 24-24h360V80c0-21.367 25.899-32.042 40.971-16.971l80 80c9.372 9.373 9.372 24.569 0 33.941l-80 80C409.956 271.982 384 261.456 384 240v-48H24c-13.255 0-24-10.745-24-24zm488 152H128v-48c0-21.314-25.862-32.08-40.971-16.971l-80 80c-9.372 9.373-9.372 24.569 0 33.941l80 80C102.057 463.997 128 453.437 128 432v-48h360c13.255 0 24-10.745 24-24v-16c0-13.255-10.745-24-24-24z"
                  ></path>
                </svg>
              </a>
            </div>
          </div>
        </Flex>
      </Flex>
      <br />
    </>
  );
};
