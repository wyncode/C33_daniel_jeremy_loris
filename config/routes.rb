Rails.application.routes.draw do
  get 'hello_world', to: 'hello_world#index'
  root 'fuel_stations#index'

  resources :fuel_stations, only: [:index]
  resources :vehicles, only: [:show, :index]
end
