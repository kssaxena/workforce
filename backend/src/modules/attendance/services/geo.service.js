const EARTH_RADIUS_METERS = 6371000;

const toRadians = (degrees) => {
  return (degrees * Math.PI) / 180;
};

export const calculateDistanceInMeters = ({
  latitude1,
  longitude1,
  latitude2,
  longitude2,
}) => {
  const lat1 = toRadians(latitude1);
  const lat2 = toRadians(latitude2);

  const deltaLatitude = toRadians(latitude2 - latitude1);

  const deltaLongitude = toRadians(longitude2 - longitude1);

  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLongitude / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
};

export const isWithinRadius = ({
  employeeLatitude,
  employeeLongitude,
  officeLatitude,
  officeLongitude,
  radius,
}) => {
  const distance = calculateDistanceInMeters({
    latitude1: employeeLatitude,
    longitude1: employeeLongitude,
    latitude2: officeLatitude,
    longitude2: officeLongitude,
  });

  return {
    distance,
    withinRadius: distance <= radius,
  };
};
