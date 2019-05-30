class FuelStationsController < ApplicationController
  def index
    if params[:origin].present? && params[:destination].present?
      @stations = AlternateFuelStationFinder.new(
                    params[:origin], params[:destination]
                  ).run rescue []
      if @stations.size > 0
        page      = (params[:page] || 1).to_i
        per_page  = 50
        @stations = @stations.paginate(page: page, per_page: per_page)
      end
    else
      @stations = []
    end
  end
end
