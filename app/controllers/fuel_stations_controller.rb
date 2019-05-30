

class FuelStationsController < ApplicationController
  
  def index 
    if params[:origin].present? && params[:destination].present?
      @stations = AlternateFuelStationFinder.new(params[:origin], params[:destination]).run rescue []
      if @stations.count >= 5
        @stations = @stations.paginate(page: params[:page], per_page: 5)
      end
    else 
      @stations = []
    end
  end
end