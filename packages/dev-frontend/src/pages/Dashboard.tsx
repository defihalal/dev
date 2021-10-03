import { Container } from "theme-ui";

import { Trove } from "../components/Trove/Trove";
import { Stability } from "../components/Stability/Stability";
import { SystemStats } from "../components/SystemStats";
import { Staking } from "../components/Staking/Staking";
import { ProtocolInformation } from "../components/ProtocolInformation";

export const Dashboard: React.FC = () => (
  <Container variant="columns">
    <Container variant="left">
      <Trove />
      <Stability />
      <Staking />
    </Container>

    <Container variant="right">
      <SystemStats />
      <ProtocolInformation />
    </Container>
  </Container>
);
