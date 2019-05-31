class VehiclesController < ApplicationController
 

  def index
    vehicles = Vehicle.all
    vehicles = vehicles.filter_model(params[:model]) if params[:model]
    vehicles = vehicles.filter_make(params[:make]) if params[:make]
    render json: vehicles
  end

  def show
   
  end
end