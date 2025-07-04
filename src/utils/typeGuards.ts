
import { IRoute, IBus, IPass } from '@/types';

export const getRouteDisplay = (route: string | IRoute | null): string => {
  if (!route) return 'No route assigned';
  if (typeof route === 'string') return route;
  return `${route.start} → ${route.end}`;
};

export const getBusName = (bus: string | IBus | null): string => {
  if (!bus) return 'No bus assigned';
  if (typeof bus === 'string') return bus;
  return bus.name;
};

export const getRouteId = (route: string | IRoute | null): string => {
  if (!route) return '';
  if (typeof route === 'string') return route;
  return route._id;
};

export const getBusId = (bus: string | IBus | null): string => {
  if (!bus) return '';
  if (typeof bus === 'string') return bus;
  return bus._id;
};

export const getPassId = (pass: string | IPass | null): string => {
  if (!pass) return '';
  if (typeof pass === 'string') return pass;
  return pass._id;
};

export const isRoute = (route: string | IRoute | null): route is IRoute => {
  return typeof route === 'object' && route !== null && '_id' in route;
};

export const isBus = (bus: string | IBus | null): bus is IBus => {
  return typeof bus === 'object' && bus !== null && '_id' in bus;
};

export const isPass = (pass: string | IPass | null): pass is IPass => {
  return typeof pass === 'object' && pass !== null && '_id' in pass;
};
