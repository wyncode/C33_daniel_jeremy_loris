class Vehicle < ApplicationRecord
  scope :filter_make, -> (search_make)  { where("lower(make) = ?", search_make.downcase) }

  def as_json(options={})
    {
      id:     id,
      make:   make,
      model:  name,
      range:  range
    }
  end
end
