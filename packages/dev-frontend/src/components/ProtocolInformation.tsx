import React from "react";
import { Card, Box } from "theme-ui";

export const ProtocolInformation: React.FC = () => {
  return (
    <Card>
      <Box sx={{ p: [2, 3] }}>
        This is one of frontends for the DeFi Halal Protocol. If you'd like to run your own frontend,
        visit our{" "}
        <a
          href="https://github.com/defihalal/frontend-registry"
          target="_blank"
          rel="noreferrer"
          title="Github"
          style={{ textDecoration: "none" }}
        >
          Github
        </a>{" "}
        and register it there as well as join our community in{" "}
        <span>
          <a
            href="https://discord.gg/DS7hej8atX"
            target="_blank"
            rel="noreferrer"
            title="Discord"
            style={{ textDecoration: "none" }}
          >
            Discord.
          </a>
          <br />
          <br />
          Please note that if your transaction is taking too long for Metamask to pop up a
          confirmation window, please reload your page and try again.
        </span>
      </Box>
    </Card>
  );
};
