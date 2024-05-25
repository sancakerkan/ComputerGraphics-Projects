    # ----------
    # Erkan Sancak, Elif Aysu Kürşad
    # TODO 5: FRESNEL
    #
    # In case we don't use fresnel, get reflectivity k_r directly using:
    reflectivity = mat.mirror_reflectivity
    # Otherwise, calculate k_r using Schlick’s approximation
    if mat.use_fresnel:
        # calculate R_0: R_0 = ((n1 - n2) / (n1 + n2))^2
        # Here n1 is the IOR of air, so n1 = 1
        # n2 is the IOR of the object, you can read it from the material property using: mat.ior
        # FILL IN YOUR CODE
        R_0 = ((1 - mat.ior) / (1 + mat.ior))**2
        # Calculate reflectivity k_r = R_0 + (1 - R_0) (1 - cos(theta))^5 where theta is the incident angle.
        cos_theta = -ray_dir.dot(hit_norm)
        fresnel_factor = R_0 + (1 - R_0) * (1 - cos_theta)**5
        reflectivity = fresnel_factor # REPLACE WITH YOUR CODE
    #
    # Re-run this script, and render the scene to check your result with Checkpoint 5.
    # ----------

    # ----------
    # TODO 4: RECURSION AND REFLECTION
    # If the depth is greater than zero, generate a reflected ray from the current x
    # If the depth is greater than zero, generate a reflected ray from the current intersection point using the direction D_reflect to determine the color contribution L_reflect.  
    # Multiply L_reflect by the reflectivity k_r, and then combine the result with the pixel color.
    #
    # Similar to how we handle shadow ray casting, it's important to account for self-occlusion in this context as well.
    # Remember to update depth at the end!
    if depth > 0:
        # Get the direction for reflection ray
        # D_reflect = D - 2 (D dot N) N
        # FILL IN YOUR CODE
        D_reflect = ray_dir - 2 * hit_norm.dot(ray_dir) * hit_norm
        D_reflect.normalize()
        # Recursively trace the reflected ray and store the return value as a color L_reflect
        reflect_color = RT_trace_ray(scene, hit_loc + eps * hit_norm, D_reflect, lights, depth - 1) # REPLACE WITH YOUR CODE
        
        # Add reflection to the final color: k_r * L_reflect
        color += reflectivity * reflect_color
        #
        # Re-run this script, and render the scene to check your result with Checkpoint 4.
        # ----------

        # ----------
        # TODO 6: TRANSMISSION
        #
        # If the depth is greater than zero, generate a transmitted ray from the current 
        # point of intersection using the direction D_transmit to calculate the color contribution L_transmit. 
        # Multiply this by (1 - k_r) * mat.transmission, and then add the result into the pixel color.
        #
        # Ensure that the refractive indices (n1 and n2) are assigned based on the media through which the ray is passing (as specified by ray_inside_object)
        # Use the refractive index of the object (mat.ior) and set the refractive index of air as 1
        # Proceed with the calculation of D_transmit only if the value under the square root is positive.
        if mat.transmission > 0:
            # FILL IN YOUR CODE
            n1 = 1 if not ray_inside_object else mat.ior
            n2 = mat.ior if ray_inside_object else 1
            cos_theta_i = -ray_dir.dot(hit_norm)
            sin_theta_i = sqrt(1.0 - cos_theta_i**2)
            sin_theta_t = (n1 / n2) * sin_theta_i
            
            if sin_theta_t > 1.0:
                D_transmit = ray_dir - 2 * hit_norm.dot(ray_dir) * hit_norm
            else:
                cos_theta_t = sqrt(1.0 - sin_theta_t**2)
                D_transmit = (n1 / n2) * ray_dir + ((n1 / n2) * cos_theta_i - cos_theta_t) * hit_norm
            
            D_transmit.normalize()    
            transmit_color = RT_trace_ray(scene, hit_loc - eps * hit_norm, D_transmit, lights, depth - 1)
                # Add transmission to the final color: (1 - k_r) * L_transmit
            color += (1 - reflectivity) * mat.transmission * transmit_color * 0.5 # REPLACE WITH YOUR CODE
    #
    # Re-run this script, and render the scene to check your result with Checkpoint 6.
    # ----------

    return color