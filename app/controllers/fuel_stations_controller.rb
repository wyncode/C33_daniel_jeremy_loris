class FuelStationsController < ApplicationController
  
  def index 
    
    if !params[:origin] || !params[:destination]
      @stations = []
    else 
      @stations = AlternateFuelStationFinder.new(params[:origin], params[:destination]).run
    end

    
  end #def


end