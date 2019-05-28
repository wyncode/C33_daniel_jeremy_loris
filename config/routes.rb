Rails.application.routes.draw do
  get 'fuel_stations/index'

  root 'fuel_stations#index'
end
