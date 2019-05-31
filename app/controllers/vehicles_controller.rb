class VehiclesController < ApplicationController
  def index
    vehicles = Vehicle.all
    vehicles = vehicles.filter_make(params[:make]) if params[:make].present?
    render json: vehicles
  end

  def show
    vehicle = Vehicle.find(params[:id])
    render json: vehicle   
  end
end
