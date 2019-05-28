class AlternateFuelStationFinder
  attr_reader :origin, :destination

  def initialize(origin, destination)
    @origin       = get_coordinates(origin)
    @destination  = get_coordinates(destination)
  end

  def run
    response = HTTParty.get("http://router.project-osrm.org/route/v1/driving/#{origin['lng']},#{origin['lat']};#{destination['lng']},#{destination['lat']}?overview=full&geometries=geojson")
    points = JSON.parse(response.body)['routes'].first['geometry']['coordinates']
    linestring = points.map{|point| "#{point.first} #{point.last}" }.join(', ')
    response = HTTParty.post("https://developer.nrel.gov/api/alt-fuel-stations/v1/nearby-route.json?api_key=#{ENV['NREL_API_KEY']}",
      body: URI.encode_www_form({
        'fuel_type' => 'ELEC',
        'distance'  => '5',
        'route'     => "LINESTRING(#{linestring})"
      }),
      headers: {
        'Content-Type' => 'application/x-www-form-urlencoded'
      }
    )
    JSON.parse(response.body)
  end

  private

  def get_coordinates(location)
    response = HTTParty.get("https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=#{location}&inputtype=textquery&fields=geometry&key=#{ENV['GOOGLE_API_KEY']}")
    JSON.parse(response.body)['candidates'].first['geometry']['location']
  end
end
