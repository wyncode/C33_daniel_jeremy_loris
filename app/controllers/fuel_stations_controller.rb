class FuelStationsController < ApplicationController
  def index
    respond_to do |format|
      format.html do
        @makes  = Vehicle.pluck(:make).uniq.sort
        @models = Vehicle.all.group_by{ |vehicle| vehicle.make }
      end
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
                              address: station["street_address"],
                              zip: station["zip"],
                              phone: station["station_phone"]
                            }
                          }
                        end
                      }
      end
    end
  end
end
