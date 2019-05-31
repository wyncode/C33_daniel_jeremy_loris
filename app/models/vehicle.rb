class Vehicle < ApplicationRecord
    scope :filter_make, -> (search_make) { where(make: search_make ) }
    scope :filter_model, -> (search_model) { where(name:search_model ) }
end
