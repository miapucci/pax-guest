import type { Metadata } from 'next';
import { fetchHostRequests } from './actions';
import RequestsClient from './_components/RequestsClient';

export const metadata: Metadata = { title: 'Requests — Pax' };
export const revalidate = 0;

export default async function RequestsPage() {
  const { requests, propertyIds } = await fetchHostRequests();
  return <RequestsClient initialRequests={requests} propertyIds={propertyIds} />;
}
