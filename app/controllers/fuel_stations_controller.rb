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
  end
end
