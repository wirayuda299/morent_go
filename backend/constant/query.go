package constant

var BaseQuery string = `SELECT
			c.id,
			c.name,
			c.type,
			c.owner,
			c.price,
			c.capacity,
			c.description,
			c.city,
			c.country,
			c.street_address,
			c.fuel_tank_size,
			c.transmission,
      c.features,
			COALESCE(json_agg(json_build_object('public_id', t.image_id, 'url', t.url))
				FILTER (WHERE t.image_id IS NOT NULL), '[]') AS thumbnails,
			CASE
				WHEN f.user_id = $1 THEN TRUE
				ELSE FALSE
			END AS is_favorite
		FROM car c
		LEFT JOIN car_thumbnails t ON c.id = t.car_id
		LEFT JOIN favorite_car f ON c.id = f.car_id AND f.user_id = $1`
