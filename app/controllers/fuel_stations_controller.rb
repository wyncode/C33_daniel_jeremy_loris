class FuelStationsController < ApplicationController
  def index
    respond_to do |format|
      format.html
      format.json do
        stations = AlternateFuelStationFinder.new(
          {'lat' => params[:origin_lat], 'lng' => params[:origin_lng]},
          {'lat' => params[:destination_lat], 'lng' => params[:destination_lng]}
        ).run
        render json:  {
                        type: "FeatureCollection",
                        features: stations.map do |station|
                          {
                            type: "Feature",
                            geometry: {
                              type: "Point",
                              coordinates: [station["longitude"], station["latitude"]]
                            },
                            properties: {
                              id: station["id"],
                              name: station["station_name"],
                              phone: station["station_phone"]
                            }
                          }
                        end
                      }
      end
    end
  end
end
