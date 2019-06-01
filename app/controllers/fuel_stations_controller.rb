class FuelStationsController < ApplicationController
  def index
    if params[:origin].present? && params[:destination].present?
      begin
        @stations = AlternateFuelStationFinder.new(
                      params[:origin], params[:destination]
                    ).run
      rescue StandardError => e
        @stations = []
        flash.now[:alert] = e.message
      end
    else
      @stations = []
    end
    page      = (params[:page] || 1).to_i
    per_page  = 50
    @stations = @stations.paginate(page: page, per_page: per_page)
  
    respond_to do |format|
      format.html
      format.json do
        @stations = AlternateFuelStationFinder.all
        render json:  {
                        type: "FeatureCollection",
                        features: @stations.map do |station|
                          {
                            type: "Feature",
                            geometry: {
                              type: "Point",
                              coordinates: [station.longitude, station.latitude]
                            },
                            properties: {
                              name: station.name,
                              id: station.id
                            }
                          }
                        end
                      }
      end
    end
  end
end
