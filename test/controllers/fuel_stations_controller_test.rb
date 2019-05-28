require 'test_helper'

class FuelStationsControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get fuel_stations_index_url
    assert_response :success
  end

end
