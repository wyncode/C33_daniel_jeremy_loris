export const parseGeoJson = (data = []) => {
  if (!data.length) return;
  const features = data.map(item => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [item.longitude, item.latitude]
    },
    properties: { ...item }
  }));
  return {
    type: "FeatureCollection",
    features
  };
};
