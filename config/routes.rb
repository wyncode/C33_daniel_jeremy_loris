Rails.application.routes.draw do
  root 'fuel_stations#index'
  resources :fuel_stations, only: [:index]
end
