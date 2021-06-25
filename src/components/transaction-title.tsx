import * as React from 'react';

import { Box, BoxProps, Stack, StackProps } from '@stacks/ui';
import { Status, Statuses } from '@components/status';
import { Tag, TagProps } from '@components/tags';

import { Title } from '@components/typography';
import { Transaction } from '@stacks/stacks-blockchain-api-types';
import { getContractName, getFunctionName, microToStacks, truncateMiddle } from '@common/utils';

export interface TitleProps {
  contractName?: string;
  tx: Transaction;
}

const Tags = ({
  type,
  ...rest
}: { type: Transaction['tx_type'] | Transaction['tx_type'][] } & BoxProps) =>
  Array.isArray(type) ? (
    <Box {...rest}>
      <Stack isInline spacing="tight">
        {type.map((t: Transaction['tx_type'], key) => (
          <Tag color="white" bg="rgba(255,255,255,0.24)" type={t} key={key} />
        ))}
      </Stack>
    </Box>
  ) : (
    <Tag
      color="white"
      bg="rgba(255,255,255,0.24)"
      type={type}
      {...(rest as Omit<TagProps, 'type'>)}
    />
  );

export type SuccessStatuses = 'success_microblock' | 'success_anchor_block';

const TitleDetail = ({
  status,
  type,
  ...rest
}: TitleProps & {
  status: Transaction['tx_status'] | SuccessStatuses;
  type: Transaction['tx_type'];
} & BoxProps) => (
  <Box {...rest}>
    <Stack isInline spacing="tight">
      <Tags type={type} />
      <Status status={status} />
    </Stack>
  </Box>
);

export const getTxTitle = (transaction: Transaction) => {
  switch (transaction.tx_type) {
    case 'smart_contract':
      return getContractName(transaction?.smart_contract?.contract_id);
    case 'contract_call':
      return getFunctionName(transaction);
    case 'token_transfer':
      return `${microToStacks(transaction.token_transfer.amount)} STX transfer`;
    case 'coinbase':
      return `Block #${transaction.block_height} coinbase`;
    default:
      return truncateMiddle(transaction.tx_id, 10);
  }
};

export const TransactionTitle = ({ contractName, tx, ...rest }: TitleProps & StackProps) => {
  let txStatus: Statuses;
  if (tx.tx_status === 'success' && !!tx.microblock_hash) {
    txStatus = 'success_microblock';
  } else if (tx.tx_status === 'success' && !tx.microblock_hash) {
    txStatus = 'success_anchor_block';
  } else {
    txStatus = tx.tx_status;
  }

  return (
    <Stack spacing="base" {...rest}>
      <Title as="h1" fontSize="36px" color="white" mt="72px">
        {getTxTitle(tx)}
      </Title>
      <TitleDetail tx={tx} status={txStatus} type={tx.tx_type} />
    </Stack>
  );
};
