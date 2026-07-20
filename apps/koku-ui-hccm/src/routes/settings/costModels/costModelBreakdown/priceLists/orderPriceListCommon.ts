import type { CostModel } from 'api/costModels';
import type { PriceListData } from 'api/priceList';
import type { Query } from 'api/queries/query';

export interface PriceListDataExt extends PriceListData {
  priority?: number;
}

export interface OrderPriceListMapProps {
  costModel?: CostModel;
  pageNumber?: number;
  perPage?: number;
  query?: Query;
}

export interface OrderPriceListStateProps {
  priceLists: PriceListDataExt[];
  priceListsTotal: number;
}

export interface OrderPriceListHandle {
  save: () => void;
}

export const baseQuery: Query = {
  limit: 10,
  offset: 0,
  filter_by: {},
  order_by: {
    name: 'asc',
  },
};
